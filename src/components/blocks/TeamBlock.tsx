import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Linkedin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TeamBlock({ title, members }: any) {
  if (!members || members.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main tracking-tight">
              {title}
            </h2>
            <div className="w-16 h-1.5 bg-primary mx-auto mt-4 rounded-full" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {members.map((member: any, index: number) => {
            const avatarUrl =
              typeof member.image === "object" && member.image?.url
                ? member.image.url
                : "/placeholder.jpg";

            return (
              <Card
                key={index}
                className="group overflow-hidden rounded-2xl border-border shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-muted">
                  <Image
                    src={avatarUrl}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    unoptimized
                  />
                </div>
                <CardContent className="p-6 text-center bg-surface relative">
                  <h3 className="text-xl font-bold text-text-main mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
                    {member.role}
                  </p>

                  {member.linkedin && (
                    <Link
                      href={member.linkedin}
                      target="_blank"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-muted text-text-muted hover:bg-info hover:text-info-foreground transition-colors duration-300 shadow-sm"
                    >
                      <Linkedin className="w-5 h-5" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
