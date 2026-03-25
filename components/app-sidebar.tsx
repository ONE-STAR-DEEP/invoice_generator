import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BarChart, CreditCard, Edit, FileText, Home, LogOut, Users } from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from "./SystemTheme/theme-toggle"
import Link from "next/link"
import LogoutButton from "./logout-button"

export function AppSidebar() {
    return (
        <Sidebar
            className="h-[calc(100vh-3rem)] mt-12 flex flex-col py-4 rounded-2xl"
            variant="floating"
        >

            {/* Header */}
            <SidebarHeader className="flex flex-row items-center gap-2 px-4">
                <Image src="/logo.png" height={30} width={30} alt="logo" />
                <h2 className="text-xl font-bold">Invoice Generator</h2>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>

                    <SidebarMenu>
                        <Link href="/dashboard">
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Home className="w-4 h-4" />
                                    Dashboard
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </Link>

                        <SidebarMenuItem>
                            <Link href="/dashboard/invoice">
                                <SidebarMenuButton>
                                    <FileText className="w-4 h-4" />
                                    Invoice
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link
                                href="/dashboard/clients">
                                <SidebarMenuButton>
                                    <Users className="w-4 h-4" />
                                    Clients
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link href="/dashboard/payments">
                                <SidebarMenuButton>
                                    <CreditCard className="w-4 h-4" />
                                    Payments
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link href="/dashboard/reports">
                                <SidebarMenuButton>
                                    <BarChart className="w-4 h-4" />
                                    Reports
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Account Actions</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Edit className="w-4 h-4" />
                                Update
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <LogoutButton />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="flex flex-row justify-end">

            </SidebarFooter>
        </Sidebar>
    )
}