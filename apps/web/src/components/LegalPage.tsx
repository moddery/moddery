type LegalPageKind = 'terms' | 'privacy' | 'safety';

const pages: Record<
  LegalPageKind,
  {
    intro: string;
    sections: { body: string; title: string }[];
    title: string;
  }
> = {
  privacy: {
    intro:
      'We collect the minimum account, project, security, and analytics data needed to operate the service.',
    sections: [
      {
        title: 'Account data',
        body: 'Profiles, email state, sessions, API tokens, team membership, and moderation history are stored to provide authenticated publishing and account recovery.',
      },
      {
        title: 'Project data',
        body: 'Uploaded files, images, hashes, scan results, descriptions, reports, and public project metadata are stored so projects can be reviewed and distributed.',
      },
      {
        title: 'Operational data',
        body: 'Request metadata, rate-limit events, download events, and diagnostics may be retained to keep the platform secure and reliable.',
      },
      {
        title: 'Contact',
        body: 'Privacy and deletion requests should include the account username and an email address that can receive account verification.',
      },
    ],
    title: 'Privacy',
  },
  safety: {
    intro:
      'Public beta uploads are reviewed for malware, impersonation, spam, and harmful behavior before they are exposed broadly.',
    sections: [
      {
        title: 'Upload review',
        body: 'Release files are scanned before a version can be created, and downloads require a clean scan record before serving.',
      },
      {
        title: 'Reports',
        body: 'Users can report projects, versions, and accounts for malware, abuse, policy violations, or inaccurate metadata.',
      },
      {
        title: 'Enforcement',
        body: 'Moderators may reject releases, archive projects, suspend accounts, revoke tokens, remove content, or block downloads when risk is present.',
      },
      {
        title: 'Security contact',
        body: 'Security reports should include reproduction steps, affected project or file identifiers, and whether the issue is actively exploitable.',
      },
    ],
    title: 'Safety',
  },
  terms: {
    intro:
      'By using Moddery, you agree to publish only content you have rights to share and to follow platform moderation decisions.',
    sections: [
      {
        title: 'Creator responsibility',
        body: 'Creators are responsible for project metadata, uploaded files, licenses, dependencies, and keeping releases free of malware or deceptive behavior.',
      },
      {
        title: 'Allowed content',
        body: 'Projects must be legal to distribute, accurately described, non-malicious, and suitable for a public Minecraft project index.',
      },
      {
        title: 'Platform operations',
        body: 'We may limit, reject, archive, or remove accounts and content to protect users, comply with law, or keep the service reliable.',
      },
      {
        title: 'Beta availability',
        body: 'During public beta, features, limits, and data retention policies may change as the platform is hardened.',
      },
    ],
    title: 'Terms',
  },
};

export function LegalPage({ page }: { page: LegalPageKind }) {
  const content = pages[page];

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink">
        {content.title}
      </h1>
      <p className="mt-4 text-base leading-7 text-muted">{content.intro}</p>

      <div className="mt-8 grid gap-7">
        {content.sections.map((section) => (
          <section key={section.title} className="border-t border-line pt-6">
            <h2 className="text-lg font-extrabold text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
