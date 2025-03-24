"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <ListTodo className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">TaskFlow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="/sign-in"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                  >
                    Manage tasks efficiently with TaskFlow
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                  >
                    Streamline your workflow, automate repetitive tasks, and
                    collaborate seamlessly with your team.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                >
                  <Link href="/sign-in">
                    <Button size="lg" className="group">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="flex items-center justify-center"
              >
                <div className="relative w-full aspect-video overflow-hidden rounded-xl border bg-background shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background p-6">
                    <div className="space-y-2">
                      <div className="h-2 w-20 rounded-lg bg-primary/20" />
                      <div className="h-2 w-16 rounded-lg bg-primary/20" />
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4 shadow-sm">
                        <ListTodo className="h-6 w-6 mb-2 text-primary" />
                        <div className="text-sm font-medium">Total Tasks</div>
                        <div className="text-2xl font-bold">24</div>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4 shadow-sm">
                        <CheckCircle className="h-6 w-6 mb-2 text-green-500" />
                        <div className="text-sm font-medium">Completed</div>
                        <div className="text-2xl font-bold">18</div>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4 shadow-sm">
                        <Clock className="h-6 w-6 mb-2 text-orange-500" />
                        <div className="text-sm font-medium">Pending</div>
                        <div className="text-2xl font-bold">6</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything you need to manage tasks
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  TaskFlow provides a comprehensive set of features to help you
                  manage tasks efficiently and collaborate with your team.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Task Management",
    description:
      "Create, assign, and track tasks with ease. Set due dates, priorities, and monitor progress.",
    icon: <ListTodo className="h-6 w-6 text-primary" />,
  },
  {
    title: "Dashboard Analytics",
    description:
      "Get a comprehensive overview of all tasks with detailed statistics and progress tracking.",
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
  },
  {
    title: "Automated Tasks",
    description:
      "Set up recurring tasks with customizable intervals to automate your workflow.",
    icon: <Clock className="h-6 w-6 text-primary" />,
  },
  {
    title: "Team Collaboration",
    description:
      "Assign tasks to team members, track their progress, and collaborate efficiently.",
    icon: <ListTodo className="h-6 w-6 text-primary" />,
  },
  {
    title: "Activity Logs",
    description:
      "Keep track of all actions performed on tasks with detailed activity logs.",
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
  },
  {
    title: "Admin Controls",
    description:
      "Manage users, departments, and system settings with powerful admin controls.",
    icon: <Clock className="h-6 w-6 text-primary" />,
  },
];
