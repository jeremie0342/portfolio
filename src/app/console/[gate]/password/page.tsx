import { requireConsole } from "@/lib/console";
import { readAccount } from "@/lib/account";
import { Shell, Head } from "@/components/console/shell";
import { PasswordForm } from "@/components/console/password-form";

/**
 * The password screen, and on a first login the only page reachable.
 *
 * It guards itself with the exception that lets it be seen: the redirect that
 * sends every other page here would send this one to itself.
 *
 * The bootstrap password exists in a file that has been copied, pasted and
 * probably scrolled past in a terminal. Treating it as temporary is the point
 * of the whole flow, so the first visit says so rather than presenting an
 * optional setting.
 */
export default async function Password({
  params,
}: PageProps<"/console/[gate]/password">) {
  const { gate } = await params;
  await requireConsole(gate, { changing: true });

  const account = await readAccount();
  const first = account?.mustChange ?? false;

  return (
    <Shell gate={gate}>
      <Head title={first ? "Choisir un mot de passe" : "Changer le mot de passe"} />

      <p className="measure text-body-l">
        {first
          ? "Celui qui vous a ouvert la porte vient d’un fichier de configuration : il a été copié, collé, et il est resté affiché dans un terminal. Choisissez-en un qui n’a existé nulle part ailleurs."
          : "Le nouveau prend effet immédiatement. La session en cours reste ouverte, les autres non."}
      </p>

      <PasswordForm gate={gate} first={first} />
    </Shell>
  );
}
