import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ContentSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                <img
                    className="rounded-(--radius) grayscale"
                    src="/contentImage.jpeg"
                    alt="student performance image"
                    height=""
                    width=""
                    loading="lazy"
                />

                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-medium">
                        One platform to track, analyze and improve student performance.
                    </h2>

                    <div className="space-y-6">
                        <p>
                            Our Student Performance System helps students, teachers, and parents
                            understand academic progress through smart analytics, visual dashboards,
                            attendance insights, mental-health indicators, and personalized reports.
                            The platform connects all key data points to support better learning and
                            well-being.
                        </p>

                        <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="gap-1 pr-1.5"
                        >
                            <Link href="#">
                                <span>Explore Features</span>
                                <ChevronRight className="size-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
