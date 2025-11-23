import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

export default function LogoCloud() {
    return (
        <section className="bg-muted dark:bg-background overflow-hidden py-16">
            <div className="group relative m-auto max-w-7xl px-6">
                <div className="flex flex-col items-center md:flex-row">
                    
                    {/* Updated Heading */}
                    <div className="md:max-w-44 md:border-r md:pr-6">
                        <img
                            src="nerd.png"
                            alt="Logo Cloud"
                        />
                    </div>

                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider speedOnHover={20} speed={40} gap={112}>

                            {/* Udemy */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-6 w-fit dark:invert"
                                    src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg"
                                    alt="Udemy Logo"
                                />
                            </div>

                            {/* LeetCode */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-7 w-fit dark:invert"
                                    src="leetcode.png"
                                    alt="LeetCode Logo"
                                />
                            </div>

                            {/* GeeksforGeeks */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-7 w-fit dark:invert"
                                    src="gfg.png"
                                    alt="GeeksforGeeks Logo"
                                />
                            </div>

                            {/* AWS */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-6 w-fit dark:invert"
                                    src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                                    alt="AWS Logo"
                                />
                            </div>

                            {/* Coursera */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-6 w-fit dark:invert"
                                    src="coursera.png"
                                    alt="Coursera Logo"
                                />
                            </div>

                            {/* ChatGPT */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit"
                                    src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
                                    alt="ChatGPT Logo"
                                />
                            </div>

                            {/* VS Code */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-7 w-fit dark:invert"
                                    src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg"
                                    alt="VS Code Logo"
                                />
                            </div>

                            {/* Claude */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-7 w-fit dark:invert"
                                    src="claude.png"
                                    alt="Claude Logo"
                                />
                            </div>

                            {/* Microsoft Education */}
                            <div className="flex">
                                <img
                                    className="mx-auto h-6 w-fit dark:invert"
                                    src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                                    alt="Microsoft Logo"
                                />
                            </div>

                        </InfiniteSlider>

                        {/* Blur Fades */}
                        <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                        <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>

                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
