import Link from 'next/link'

const members = [
    {
        name: 'Balaram G',
        role: 'Class 5A',
        avatar: 'balram.jpeg',
        link: 'https://www.linkedin.com/in/balaram-g-692508324/',
    },
    {
        name: 'Karthik N',
        role: 'Class 5A',
        avatar: 'karthik.jpeg',
        link: 'https://www.linkedin.com/in/karthik-n-a665a232b/',
    }
]

export default function TeamSection() {
    return (
        <section className="py-16 md:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-5xl border-t px-6">
                    <div className="">
                        <h2 className="text-3xl font-bold sm:text-4xl">Certified Codeblooded Nerds of 5A</h2>
                    </div>

                <div className=" md:mt-24">
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">

                        {members.map((member, index) => (
                            <div
                                key={index}
                                className="group overflow-hidden"
                            >
                                <img
                                    className="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl"
                                    src={member.avatar}
                                    alt="team member"
                                    width="826"
                                    height="1239"
                                />

                                <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                                    <div className="flex justify-between">
                                        <h3 className="text-base font-medium transition-all duration-500 group-hover:tracking-wider">
                                            {member.name}
                                        </h3>
                                        <span className="text-xs">_0{index + 1}</span>
                                    </div>

                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-muted-foreground inline-block translate-y-6 text-sm opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            {member.role}
                                        </span>
                                        <Link
                                            href={member.link}
                                            className="group-hover:text-primary-600 dark:group-hover:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100"
                                        >
                                            LinkedIn
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </section>
    )
}
