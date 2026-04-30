import { RichText } from "@payloadcms/richtext-lexical/react";

export function ContentBlock({ content }: any) {
  if (!content) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div
          className="
          text-text-muted leading-relaxed space-y-6
          [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-text-main [&>h2]:mt-12 [&>h2]:mb-6
          [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-text-main [&>h3]:mt-8 [&>h3]:mb-4
          [&>p]:text-lg
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:text-lg
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-2 [&>ol>li]:text-lg
          [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80
          [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:mx-auto [&_img]:my-10
        "
        >
          <RichText data={content} />
        </div>
      </div>
    </section>
  );
}
