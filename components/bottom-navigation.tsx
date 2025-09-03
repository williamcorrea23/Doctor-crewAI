"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, ClipboardList, PenTool, Info, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface BottomNavigationProps {
  currentPage?: string
}

export function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    { href: "/tutorial", icon: Info, label: "Tutorial", id: "tutorial" },
    { href: "/", icon: Home, label: "Dashboard", id: "dashboard" },
    { href: "/aulas", icon: BookOpen, label: "Aulas", id: "aulas" },
    { href: "/exercicios", icon: ClipboardList, label: "Exercícios", id: "exercicios" },
    { href: "/redacao", icon: PenTool, label: "Redação", id: "redacao" },
  ]

  return (
    <nav className="safe-area-pb fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur-sm sm:px-4">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ href, icon: Icon, label, id }) => {
          const isActive = currentPage === id || pathname === href

          return (
            <Link
              key={id}
              href={href}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors sm:gap-1 sm:p-2 ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              <span className="max-w-[60px] truncate text-[10px] font-medium sm:max-w-none sm:text-xs">
                {label}
              </span>
            </Link>
          )
        })}

        <button
          onClick={logout}
          className="flex min-w-0 flex-col items-center gap-0.5 rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 sm:gap-1 sm:p-2"
        >
          <LogOut className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <span className="max-w-[60px] truncate text-[10px] font-medium sm:max-w-none sm:text-xs">
            Sair
          </span>
        </button>
      </div>
    </nav>
  )
}
