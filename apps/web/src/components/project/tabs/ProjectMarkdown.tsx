import rehypeRaw from 'rehype-raw';
import rehypeSanitize, {
  defaultSchema,
  type Options as RehypeSanitizeOptions,
} from 'rehype-sanitize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const allowedEmbedSrc =
  /^https:\/\/(?:(?:www\.)?youtube\.com\/embed\/|www\.youtube-nocookie\.com\/embed\/|discord\.com\/widget|ptb\.discord\.com\/widget|canary\.discord\.com\/widget)/;

const projectMarkdownSchema: RehypeSanitizeOptions = {
  ...defaultSchema,
  tagNames: [
    ...new Set([...(defaultSchema.tagNames ?? []), 'area', 'iframe', 'map']),
  ],
  attributes: {
    ...defaultSchema.attributes,
    area: ['alt', 'coords', 'href', 'shape', 'target'],
    iframe: [
      ['src', allowedEmbedSrc],
      'allow',
      'allowFullScreen',
      'frameBorder',
      'height',
      'loading',
      'referrerPolicy',
      'title',
      'width',
    ],
    img: [...(defaultSchema.attributes?.img ?? []), 'sizes', 'srcSet'],
    map: ['name'],
    source: [
      ...(defaultSchema.attributes?.source ?? []),
      'media',
      'sizes',
      'type',
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'irc', 'ircs', 'mailto', 'xmpp'],
    src: ['http', 'https'],
    srcSet: ['http', 'https'],
  },
};

export function ProjectMarkdown({ body }: { body: string }) {
  return (
    <div className="project-markdown mt-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, projectMarkdownSchema]]}
        components={{
          a: ({ children, href }) => {
            const isExternal = Boolean(href && /^https?:\/\//i.test(href));

            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },
          img: ({ alt, src }) => (
            <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" />
          ),
          input: (props) => <input {...props} readOnly />,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
