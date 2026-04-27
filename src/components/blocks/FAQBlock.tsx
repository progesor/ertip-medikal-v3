import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQBlock({ title, questions }: any) {
    return (
        <section className="py-20 container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>
            <Accordion type="single" collapsible className="w-full">
                {questions?.map((item: any, i: number) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                        <AccordionTrigger className="text-left font-semibold">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-slate-600 leading-relaxed">{item.answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    )
}