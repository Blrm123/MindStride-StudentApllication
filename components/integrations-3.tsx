import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Database, Users, BookOpen, BarChart3, Calendar, Bell } from 'lucide-react'

export default function IntegrationsSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Seamless Integration & Collaboration</h2>
                    <p className="mt-4 text-muted-foreground">Connect all aspects of student management in one unified platform</p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Integration 1: Student Data Management */}
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <Database className="size-6 text-primary" aria-hidden />
                            </div>
                            <h3 className="text-xl font-semibold">Student Data Management</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Centralized database for all student information, academic records, and personal details with secure access controls.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Integration 2: Multi-Role Access */}
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <Users className="size-6 text-primary" aria-hidden />
                            </div>
                            <h3 className="text-xl font-semibold">Multi-Role Access</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Role-based dashboards for students, teachers, parents, and administrators with customized views and permissions.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Integration 3: Academic Tracking */}
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <BookOpen className="size-6 text-primary" aria-hidden />
                            </div>
                            <h3 className="text-xl font-semibold">Academic Tracking</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Monitor grades, assignments, attendance, and academic progress with real-time updates and comprehensive reports.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Integration 4: Performance Analytics */}
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <BarChart3 className="size-6 text-primary" aria-hidden />
                            </div>
                            <h3 className="text-xl font-semibold">Performance Analytics</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Advanced analytics and visualizations to identify trends, patterns, and areas for improvement in student performance.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Integration 5: Event Management */}
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <Calendar className="size-6 text-primary" aria-hidden />
                            </div>
                            <h3 className="text-xl font-semibold">Event Management</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Schedule and track school events, parent-teacher meetings, exams, and extracurricular activities seamlessly.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Integration 6: Notifications */}
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader>
                            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <Bell className="size-6 text-primary" aria-hidden />
                            </div>
                            <h3 className="text-xl font-semibold">Smart Notifications</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Automated alerts for attendance, grades, upcoming events, and important announcements to keep everyone informed.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
