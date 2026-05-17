import type { Metadata } from "next"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Termos de Serviço — Zelo",
}

const sections = [
  {
    title: "1. Termos",
    content: (
      <p>
        Ao acessar ao site Zelo, concorda em cumprir estes termos de serviço,
        todas as leis e regulamentos aplicáveis e concorda que é responsável
        pelo cumprimento de todas as leis locais aplicáveis. Se você não
        concordar com algum desses termos, está proibido de usar ou acessar este
        site. Os materiais contidos neste site são protegidos pelas leis de
        direitos autorais e marcas comerciais aplicáveis.
      </p>
    ),
  },
  {
    title: "2. Uso de Licença",
    content: (
      <>
        <p>
          É concedida permissão para baixar temporariamente uma cópia dos
          materiais (informações ou software) no site Zelo, apenas para
          visualização transitória pessoal e não comercial. Esta é a concessão
          de uma licença, não uma transferência de título e, sob esta licença,
          você não pode:
        </p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
          <li>modificar ou copiar os materiais;</li>
          <li>
            usar os materiais para qualquer finalidade comercial ou para
            exibição pública (comercial ou não comercial);
          </li>
          <li>
            tentar descompilar ou fazer engenharia reversa de qualquer software
            contido no site Zelo;
          </li>
          <li>
            remover quaisquer direitos autorais ou outras notações de
            propriedade dos materiais; ou
          </li>
          <li>
            transferir os materiais para outra pessoa ou &quot;espelhe&quot; os materiais
            em qualquer outro servidor.
          </li>
        </ol>
        <p className="mt-2">
          Esta licença será automaticamente rescindida se você violar alguma
          dessas restrições e poderá ser rescindida por Zelo a qualquer momento.
          Ao encerrar a visualização desses materiais ou após o término desta
          licença, você deve apagar todos os materiais baixados em sua posse,
          seja em formato eletrónico ou impresso.
        </p>
      </>
    ),
  },
  {
    title: "3. Isenção de responsabilidade",
    content: (
      <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
        <li>
          Os materiais no site da Zelo são fornecidos &quot;como estão&quot;. Zelo não
          oferece garantias, expressas ou implícitas, e, por este meio, isenta
          e nega todas as outras garantias, incluindo, sem limitação, garantias
          implícitas ou condições de comercialização, adequação a um fim
          específico ou não violação de propriedade intelectual ou outra
          violação de direitos.
        </li>
        <li>
          Além disso, o Zelo não garante ou faz qualquer representação relativa
          à precisão, aos resultados prováveis ou à confiabilidade do uso dos
          materiais em seu site ou de outra forma relacionado a esses materiais
          ou em sites vinculados a este site.
        </li>
      </ol>
    ),
  },
  {
    title: "4. Limitações",
    content: (
      <p>
        Em nenhum caso o Zelo ou seus fornecedores serão responsáveis por
        quaisquer danos (incluindo, sem limitação, danos por perda de dados ou
        lucro ou devido a interrupção dos negócios) decorrentes do uso ou da
        incapacidade de usar os materiais em Zelo, mesmo que Zelo ou um
        representante autorizado da Zelo tenha sido notificado oralmente ou por
        escrito da possibilidade de tais danos. Como algumas jurisdições não
        permitem limitações em garantias implícitas, ou limitações de
        responsabilidade por danos conseqüentes ou incidentais, essas limitações
        podem não se aplicar a você.
      </p>
    ),
  },
  {
    title: "5. Precisão dos materiais",
    content: (
      <p>
        Os materiais exibidos no site da Zelo podem incluir erros técnicos,
        tipográficos ou fotográficos. Zelo não garante que qualquer material em
        seu site seja preciso, completo ou atual. Zelo pode fazer alterações nos
        materiais contidos em seu site a qualquer momento, sem aviso prévio. No
        entanto, Zelo não se compromete a atualizar os materiais.
      </p>
    ),
  },
  {
    title: "6. Links",
    content: (
      <p>
        O Zelo não analisou todos os sites vinculados ao seu site e não é
        responsável pelo conteúdo de nenhum site vinculado. A inclusão de
        qualquer link não implica endosso por Zelo do site. O uso de qualquer
        site vinculado é por conta e risco do usuário.
      </p>
    ),
  },
  {
    title: "Modificações",
    content: (
      <p>
        O Zelo pode revisar estes termos de serviço do site a qualquer momento,
        sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à
        versão atual desses termos de serviço.
      </p>
    ),
  },
  {
    title: "Lei aplicável",
    content: (
      <p>
        Estes termos e condições são regidos e interpretados de acordo com as
        leis do Zelo e você se submete irrevogavelmente à jurisdição exclusiva
        dos tribunais naquele estado ou localidade.
      </p>
    ),
  },
]

export default function TermosPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Termos de Serviço
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Última atualização: 17 de Maio de 2026
        </p>
      </div>

      {sections.map((section) => (
        <section
          key={section.title}
          className="rounded-lg border bg-card p-5 text-sm leading-relaxed text-card-foreground shadow-sm"
        >
          <h2 className="mb-3 text-base font-semibold">{section.title}</h2>
          <div className="text-muted-foreground">{section.content}</div>
        </section>
      ))}
    </div>
  )
}
