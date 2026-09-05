/**
 * A browser, reduced to what a test needs.
 *
 * The console has no API. Everything it writes goes through a form, and every
 * one of those forms is a server action reached by a plain multipart POST, so
 * the way to test the console is to do what a browser without JavaScript does:
 * read the page, take the fields it renders, put values in the ones we care
 * about and post the lot back.
 *
 * Driving the real markup is the point. A test that posted a hand-written body
 * would keep passing after a field was renamed in the page and dropped from the
 * action, which is precisely the failure worth catching.
 */

const entities = {
  "&quot;": '"',
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&#x2F;": "/",
};

export function decode(value) {
  return value.replace(
    /&(?:quot|amp|lt|gt|nbsp|#x27|#39|#x2F);/g,
    (match) => entities[match] ?? match,
  );
}

/** Strips tags, so an assertion can look for words rather than markup. */
export function text(html) {
  return decode(
    html
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");
}

function attributes(source) {
  const found = {};
  const pattern = /([A-Za-z_$:@][\w$:.@-]*)(?:\s*=\s*"([^"]*)")?/g;

  let match;
  while ((match = pattern.exec(source))) {
    found[match[1]] = match[2] === undefined ? "" : decode(match[2]);
  }

  return found;
}

/**
 * Reads the forms out of a page.
 *
 * Fields keep the value the server rendered, which is what carries the action
 * reference, the bound arguments and the current contents of an editor. A test
 * overrides the two or three it is about and leaves the rest alone.
 */
export function forms(html) {
  const all = [];
  const pattern = /<form\b([^>]*)>([\s\S]*?)<\/form>/g;

  let match;
  while ((match = pattern.exec(html))) {
    const attrs = attributes(match[1]);
    const body = match[2];
    const fields = [];

    for (const input of body.matchAll(/<input\b([^>]*)>/g)) {
      const field = attributes(input[1]);

      if (!field.name || field.type === "submit" || field.type === "button") {
        continue;
      }

      const box = field.type === "checkbox" || field.type === "radio";

      fields.push({
        name: field.name,
        value: field.value ?? "",
        /* An unchecked box sends nothing at all, which is how a boolean is
           cleared. Recording the state keeps that true through a round trip. */
        omit: box && !("checked" in field),
        box,
      });
    }

    for (const area of body.matchAll(
      /<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/g,
    )) {
      const field = attributes(area[1]);

      if (field.name) {
        fields.push({ name: field.name, value: decode(area[2]) });
      }
    }

    for (const select of body.matchAll(
      /<select\b([^>]*)>([\s\S]*?)<\/select>/g,
    )) {
      const field = attributes(select[1]);

      if (!field.name) {
        continue;
      }

      let value = "";
      let first = null;

      for (const option of select[2].matchAll(/<option\b([^>]*)>/g)) {
        const item = attributes(option[1]);
        first ??= item.value ?? "";

        if ("selected" in item) {
          value = item.value ?? "";
        }
      }

      fields.push({ name: field.name, value: value || first || "" });
    }

    all.push({
      action: attrs.action ?? "",
      method: (attrs.method ?? "GET").toUpperCase(),
      html: match[0],
      fields,
    });
  }

  return all;
}

const REDIRECTS = new Set([301, 302, 303, 307, 308]);

export class Browser {
  constructor(base) {
    this.base = base;
    this.jar = new Map();
    this.page = { url: "/", status: 0, html: "" };
  }

  cookies() {
    return [...this.jar]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  keep(response) {
    for (const header of response.headers.getSetCookie()) {
      const [pair] = header.split(";");
      const at = pair.indexOf("=");
      const name = pair.slice(0, at).trim();
      const value = pair.slice(at + 1);

      /* An expiry in the past is a deletion, and treating it as a value is how
         a test convinces itself that signing out did nothing. */
      if (/expires=Thu, 01 Jan 1970/i.test(header) || /max-age=0/i.test(header)) {
        this.jar.delete(name);
      } else {
        this.jar.set(name, value);
      }
    }
  }

  async send(url, init = {}) {
    const response = await fetch(new URL(url, this.base), {
      ...init,
      redirect: "manual",
      headers: { ...init.headers, cookie: this.cookies() },
    });

    this.keep(response);
    return response;
  }

  /** Follows redirects by hand, so cookies set on the way survive. */
  async follow(url, init) {
    let at = url;
    let response = await this.send(at, init);
    let hops = 0;

    while (REDIRECTS.has(response.status) && hops < 8) {
      at = response.headers.get("location") ?? at;
      response = await this.send(at);
      hops += 1;
    }

    const target = new URL(at, this.base);

    this.page = {
      url: target.pathname + target.search,
      status: response.status,
      html: await response.text(),
    };

    return this.page;
  }

  get(url) {
    return this.follow(url);
  }

  /** A GET that stops at the first redirect, for asserting where one leads. */
  async peek(url) {
    const response = await this.send(url);
    return {
      status: response.status,
      location: response.headers.get("location"),
    };
  }

  /**
   * Finds a form on the current page.
   *
   * The needle is matched against the form's own markup, so a caller picks one
   * by a field name, an action id or a piece of its label.
   */
  form(needle) {
    const all = forms(this.page.html);
    const found = needle
      ? all.find((item) =>
          typeof needle === "function"
            ? needle(item)
            : item.html.includes(needle),
        )
      : all[0];

    if (!found) {
      throw new Error(`no form matching ${needle} on ${this.page.url}`);
    }

    return found;
  }

  /** Fills a form with the given values and posts it. */
  submit(form, values = {}) {
    const body = new FormData();
    const used = new Set();

    for (const field of form.fields) {
      if (field.name in values) {
        const value = values[field.name];
        used.add(field.name);

        if (value === false || value === null || value === undefined) {
          continue;
        }

        if (value instanceof Blob) {
          body.append(field.name, value, values[`${field.name}:name`] ?? "file");
          continue;
        }

        body.append(
          field.name,
          value === true ? field.value || "on" : String(value),
        );
        continue;
      }

      if (field.omit) {
        continue;
      }

      body.append(field.name, field.value);
    }

    /* A value for a field the page never rendered is a mistake in the test, not
       something to send quietly and wonder about later. */
    for (const name of Object.keys(values)) {
      if (!used.has(name) && !name.endsWith(":name")) {
        throw new Error(`no field named ${name} in the form`);
      }
    }

    return this.follow(form.action || this.page.url, {
      method: form.method === "GET" ? "POST" : form.method,
      body,
    });
  }
}
