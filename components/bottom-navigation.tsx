"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, ClipboardList, PenTool, Info, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label, id }) => {
          const isActive = currentPage === id || pathname === href

          return (
            <Link
              key={id}
              href={href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}

        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Sair</span>
        </button>
      </div>
    </nav>
  )
}
