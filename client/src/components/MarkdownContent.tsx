import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Raw HTML is not rendered, and react-markdown strips unsafe URL schemes.
const components: Components = {
  h1: (props) => <h1 className="mt-4 mb-2 font-serif text-2xl text-[#292824]" {...props} />,
  h2: (props) => <h2 className="mt-4 mb-2 font-serif text-xl text-[#292824]" {...props} />,
  h3: (props) => <h3 className="mt-3 mb-1 text-lg font-semibold text-[#292824]" {...props} />,
  p: (props) => <p className="my-2 leading-7" {...props} />,
  ul: (props) => <ul className="my-2 list-disc pl-6" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal pl-6" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-2 border-l-2 border-[#ddd9d0] pl-4 text-[#716d63]" {...props} />
  ),
  code: (props) => (
    <code className="rounded bg-[#f3f1ea] px-1 py-0.5 text-sm" {...props} />
  ),
  pre: (props) => (
    <pre
className="my-3 overflow-x-auto rounded-md bg-[#f3f1ea] p-3 text-sm [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  hr: () => <hr className="my-4 border-[#ddd9d0]" />,
  table: (props) => (
    <div className="my-3 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border border-[#ddd9d0] bg-[#f3f1ea] px-3 py-1.5 text-left font-semibold" {...props} />
  ),
  td: (props) => <td className="border border-[#ddd9d0] px-3 py-1.5" {...props} />,
  a: (props) => (
    <a
      className="text-blue-600 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  img: ({ alt, ...props }) => (
    <img
      alt={alt ?? ""}
      loading="lazy"
      className="my-3 max-w-full rounded-md object-contain"
      {...props}
    />
  ),
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-[#292824] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;