import type { Metadata } from "next"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidade — Zelo",
}

const sections = [
  {
    title: "Coleta de Informações",
    content: (
      <p>
        Solicitamos informações pessoais apenas quando realmente precisamos
        delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais,
        com o seu conhecimento e consentimento. Também informamos por que
        estamos coletando e como será usado.
      </p>
    ),
  },
  {
    title: "Armazenamento e Proteção",
    content: (
      <p>
        Apenas retemos as informações coletadas pelo tempo necessário para
        fornecer o serviço solicitado. Quando armazenamos dados, protegemos
        dentro de meios comercialmente aceitáveis para evitar perdas e roubos,
        bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
      </p>
    ),
  },
  {
    title: "Compartilhamento",
    content: (
      <p>
        Não compartilhamos informações de identificação pessoal publicamente ou
        com terceiros, exceto quando exigido por lei.
      </p>
    ),
  },
  {
    title: "Links Externos",
    content: (
      <p>
        O nosso site pode ter links para sites externos que não são operados
        por nós. Esteja ciente de que não temos controle sobre o conteúdo e
        práticas desses sites e não podemos aceitar responsabilidade por suas
        respectivas políticas de privacidade.
      </p>
    ),
  },
  {
    title: "Seus Direitos",
    content: (
      <p>
        Você é livre para recusar a nossa solicitação de informações pessoais,
        entendendo que talvez não possamos fornecer alguns dos serviços
        desejados.
      </p>
    ),
  },
  {
    title: "Aceitação",
    content: (
      <p>
        O uso continuado de nosso site será considerado como aceitação de
        nossas práticas em torno de privacidade e informações pessoais. Se você
        tiver alguma dúvida sobre como lidamos com dados do usuário e
        informações pessoais, entre em contacto connosco.
      </p>
    ),
  },
  {
    title: "Publicidade e Cookies",
    content: (
      <ul className="list-inside list-disc space-y-2 text-muted-foreground">
        <li>
          O serviço Google AdSense que usamos para veicular publicidade usa um
          cookie DoubleClick para veicular anúncios mais relevantes em toda a
          Web e limitar o número de vezes que um determinado anúncio é exibido
          para você.
        </li>
        <li>
          Para mais informações sobre o Google AdSense, consulte as FAQs
          oficiais sobre privacidade do Google AdSense.
        </li>
        <li>
          Utilizamos anúncios para compensar os custos de funcionamento deste
          site e fornecer financiamento para futuros desenvolvimentos. Os
          cookies de publicidade comportamental usados por este site foram
          projetados para garantir que você forneça os anúncios mais relevantes
          sempre que possível, rastreando anonimamente seus interesses e
          apresentando coisas semelhantes que possam ser do seu interesse.
        </li>
        <li>
          Vários parceiros anunciam em nosso nome e os cookies de rastreamento
          de afiliados simplesmente nos permitem ver se nossos clientes
          acessaram o site através de um dos sites de nossos parceiros, para
          que possamos creditá-los adequadamente e, quando aplicável, permitir
          que nossos parceiros afiliados ofereçam qualquer promoção que pode
          fornecê-lo para fazer uma compra.
        </li>
      </ul>
    ),
  },
  {
    title: "Compromisso do Usuário",
    content: (
      <>
        <p className="mb-2">
          O usuário se compromete a fazer uso adequado dos conteúdos e da
          informação que o Zelo oferece no site e com caráter enunciativo, mas
          não limitativo:
        </p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>
            Não se envolver em atividades que sejam ilegais ou contrárias à boa
            fé a à ordem pública;
          </li>
          <li>
            Não difundir propaganda ou conteúdo de natureza racista,
            xenofóbica, jogos de sorte ou azar, qualquer tipo de pornografia
            ilegal, de apologia ao terrorismo ou contra os direitos humanos;
          </li>
          <li>
            Não causar danos aos sistemas físicos (hardwares) e lógicos
            (softwares) do Zelo, de seus fornecedores ou terceiros, para
            introduzir ou disseminar vírus informáticos ou quaisquer outros
            sistemas de hardware ou software que sejam capazes de causar danos
            anteriormente mencionados.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Mais informações",
    content: (
      <p>
        Esperemos que esteja esclarecido e, como mencionado anteriormente, se
        houver algo que você não tem certeza se precisa ou não, geralmente é
        mais seguro deixar os cookies ativados, caso interaja com um dos
        recursos que você usa em nosso site.
      </p>
    ),
  },
]

export default function PrivacidadePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Política de Privacidade
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Última atualização: 17 de Maio de 2026
        </p>
      </div>

      <div className="rounded-lg border bg-card p-5 text-sm leading-relaxed text-card-foreground shadow-sm">
        <p>
          A sua privacidade é importante para nós. É política do Zelo respeitar
          a sua privacidade em relação a qualquer informação sua que possamos
          coletar no site Zelo, e outros sites que possuímos e operamos.
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
