"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, FileText, Users, Globe } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"

export default function DireitosAutorais() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Direitos Autorais e Uso</h1>
            <p className="text-gray-600">Informações legais e políticas de uso</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Direitos Autorais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Direitos Autorais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Propriedade Intelectual</h3>
                <p className="text-gray-700 leading-relaxed">
                  Todo o conteúdo presente neste aplicativo, incluindo textos, imagens, logos, 
                  ícones, gráficos, vídeos, áudios e software, é protegido por direitos autorais 
                  e outras leis de propriedade intelectual. O conteúdo é de propriedade exclusiva 
                  do desenvolvedor ou de seus licenciadores.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Uso Autorizado</h3>
                <p className="text-gray-700 leading-relaxed">
                  O uso deste aplicativo é concedido apenas para fins educacionais e pessoais. 
                  É proibida a reprodução, distribuição, modificação ou criação de obras derivadas 
                  sem autorização expressa por escrito.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Conteúdo de Terceiros</h3>
                <p className="text-gray-700 leading-relaxed">
                  Algumas questões e materiais podem ser baseados em conteúdos do ENEM e outras 
                  fontes educacionais públicas. Todo o conteúdo de terceiros é utilizado de acordo 
                  com as leis de uso justo para fins educacionais.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Política de Uso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Política de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Uso Aceitável</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Utilizar o aplicativo apenas para fins educacionais</li>
                  <li>Respeitar os direitos de outros usuários</li>
                  <li>Não compartilhar credenciais de acesso</li>
                  <li>Não tentar contornar medidas de segurança</li>
                  <li>Reportar bugs e problemas de forma construtiva</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Uso Proibido</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Uso comercial sem autorização</li>
                  <li>Distribuição não autorizada do conteúdo</li>
                  <li>Tentativas de hacking ou engenharia reversa</li>
                  <li>Criação de contas falsas ou múltiplas</li>
                  <li>Spam ou comportamento abusivo</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Conformidade com Google Play */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Conformidade com Google Play
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Políticas do Google Play</h3>
                <p className="text-gray-700 leading-relaxed">
                  Este aplicativo está em conformidade com todas as políticas do Google Play Store, 
                  incluindo políticas de conteúdo, privacidade, segurança e monetização.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Conteúdo Educacional</h3>
                <p className="text-gray-700 leading-relaxed">
                  Todo o conteúdo é adequado para estudantes e focado exclusivamente em educação. 
                  Não há conteúdo inadequado, violento ou que viole as diretrizes da plataforma.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Dados do Usuário</h3>
                <p className="text-gray-700 leading-relaxed">
                  Coletamos apenas dados necessários para o funcionamento do aplicativo. 
                  Todos os dados são tratados de acordo com nossa Política de Privacidade 
                  e as regulamentações aplicáveis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Licenças de Terceiros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-600" />
                Licenças de Terceiros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Bibliotecas Open Source</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Este aplicativo utiliza várias bibliotecas de código aberto. 
                  Agradecemos aos desenvolvedores dessas ferramentas:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>React - MIT License</li>
                  <li>Next.js - MIT License</li>
                  <li>Tailwind CSS - MIT License</li>
                  <li>Lucide Icons - ISC License</li>
                  <li>Firebase - Apache License 2.0</li>
                  <li>Recharts - MIT License</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Fontes de Conteúdo</h3>
                <p className="text-gray-700 leading-relaxed">
                  O conteúdo educacional é baseado no currículo oficial do ENEM e em 
                  materiais educacionais de domínio público, sempre respeitando os 
                  direitos autorais e as licenças aplicáveis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Para questões sobre direitos autorais, uso do aplicativo ou relatórios de 
                violação, entre em contato através do email: 
                <span className="font-semibold text-blue-600"> legal@enemapp.com</span>
              </p>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Última atualização:</strong> Janeiro de 2024
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Reservamo-nos o direito de atualizar estas políticas a qualquer momento. 
                  As alterações entrarão em vigor imediatamente após a publicação.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  )
}