import React from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialBlock({ title, testimonials }: any) {
  if (!testimonials || testimonials.length === 0) return null;

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item: any, index: number) => {
            const avatarUrl =
              typeof item.avatar === "object" && item.avatar?.url
                ? item.avatar.url
                : null;

            return (
              <Card
                key={index}
                className="relative border-none bg-surface-muted rounded-3xl p-4 group hover:bg-surface-muted transition-colors duration-300"
              >
                <CardContent className="pt-10 pb-8 px-8">
                  {/* Dekoratif Tırnak İkonu */}
                  <Quote className="absolute top-8 left-8 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />

                  <blockquote className="relative z-10">
                    <p className="text-lg text-text-muted leading-relaxed italic mb-8">
                      "{item.content}"
                    </p>

                    <div className="flex items-center gap-4">
                      {avatarUrl ? (
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                          <Image
                            src={avatarUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-sm">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <cite className="not-italic font-bold text-text-main block text-lg">
                          {item.name}
                        </cite>
                        {/* Eğer ünvan alanı eklenirse buraya gelebilir */}
                        <span className="text-sm text-text-muted font-medium lowercase">
                          Referans
                        </span>
                      </div>
                    </div>
                  </blockquote>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
