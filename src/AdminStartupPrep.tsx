import { ClipboardCheck, Copy, Download, FileText, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'

type StartupForm = {
  contactName: string
  companyType: string
  companyNameCandidates: string
  businessMemo: string
  capitalPlan: string
  fiscalMonth: string
  addressMemo: string
  officersMemo: string
  specialistNotes: string
}

type StartupState = {
  form: StartupForm
  tasks: Record<string, boolean>
  customQuestions: Array<{ target: string; question: string }>
}

const storageKey = 'katsuko-admin-startup-prep-v1'

const emptyForm: StartupForm = {
  contactName: '',
  companyType: '',
  companyNameCandidates: '',
  businessMemo: '',
  capitalPlan: '',
  fiscalMonth: '',
  addressMemo: '',
  officersMemo: '',
  specialistNotes: '',
}

const emptyState: StartupState = {
  form: emptyForm,
  tasks: {},
  customQuestions: [],
}

const prepTasks = [
  {
    id: 'name',
    title: '会社名候補を整理する',
    desc: '商号調査や表記ルールは専門家に確認する前提で、候補と理由をメモします。',
  },
  {
    id: 'purpose',
    title: '事業内容を自分の言葉で整理する',
    desc: '会社目的文の作成ではなく、事業の範囲・将来やりたいこと・許認可の不安を整理します。',
  },
  {
    id: 'address',
    title: '本店所在地候補を集める',
    desc: '自宅、事務所、バーチャルオフィスなどの候補と、公開住所に関する不安をまとめます。',
  },
  {
    id: 'capital',
    title: '資本金・出資者・役員候補を整理する',
    desc: '金額や構成を確定せず、専門家に相談したい論点としてまとめます。',
  },
  {
    id: 'expert',
    title: '専門家へ依頼する範囲を分ける',
    desc: '行政書士、司法書士、税理士のどこに何を依頼するかを相談できる状態にします。',
  },
]

const questionGroups = [
  {
    target: '行政書士',
    questions: [
      'この事業に必要な許認可や事前確認はありますか。',
      '事業内容メモを正式な会社目的にする際、どの点を整理すべきですか。',
      '定款作成を依頼する場合、こちらで準備すべき情報は何ですか。',
    ],
  },
  {
    target: '司法書士',
    questions: [
      '登記手続で追加確認が必要な情報はありますか。',
      '役員構成や出資者構成で、登記上確認すべき点はありますか。',
      '本店所在地や商号について、登記前に確認すべき点はありますか。',
    ],
  },
  {
    target: '税理士',
    questions: [
      '決算月や資本金額について、税務面で相談すべき点はありますか。',
      '設立後すぐに必要な税務届出は何ですか。',
      '会計ソフト、請求書、経費管理はいつから整えるべきですか。',
    ],
  },
]

function loadStartupState(): StartupState {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return emptyState
    const parsed = JSON.parse(saved) as Partial<StartupState>

    return {
      form: { ...emptyForm, ...(parsed.form || {}) },
      tasks: parsed.tasks || {},
      customQuestions: parsed.customQuestions || [],
    }
  } catch {
    return emptyState
  }
}

function buildMemo(state: StartupState) {
  const value = (key: keyof StartupForm) => state.form[key].trim() || '未入力'
  const doneTasks = prepTasks
    .filter((task) => state.tasks[task.id])
    .map((task) => `- ${task.title}`)
    .join('\n')
  const remainingTasks = prepTasks
    .filter((task) => !state.tasks[task.id])
    .map((task) => `- ${task.title}`)
    .join('\n')
  const customQuestions = state.customQuestions.length
    ? state.customQuestions.map((item) => `- ${item.target}: ${item.question}`).join('\n')
    : '- 追加質問なし'

  return [
    '専門家相談用メモ',
    '定款案・登記申請書・各種届出書ではありません',
    '',
    '【利用目的】',
    '会社設立に向けた情報整理と、行政書士・司法書士・税理士等への相談準備。',
    '法的判断、税務判断、提出書類の作成は専門家に依頼・確認してください。',
    '',
    '【基本情報】',
    `相談者名: ${value('contactName')}`,
    `希望する会社形態: ${value('companyType')}`,
    `会社名候補メモ:\n${value('companyNameCandidates')}`,
    '',
    `事業内容メモ:\n${value('businessMemo')}`,
    '',
    `資本金予定額: ${value('capitalPlan')}`,
    `決算月候補: ${value('fiscalMonth')}`,
    `本店所在地候補:\n${value('addressMemo')}`,
    '',
    `役員・出資者の候補:\n${value('officersMemo')}`,
    '',
    `気になること・専門家に伝えたい事情:\n${value('specialistNotes')}`,
    '',
    '【完了した準備タスク】',
    doneTasks || '- まだ完了タスクなし',
    '',
    '【残っている準備タスク】',
    remainingTasks || '- すべて完了',
    '',
    '【追加で聞きたい質問】',
    customQuestions,
    '',
    '【確認してほしい専門領域】',
    '- 行政書士: 定款作成、許認可、官公署提出書類に関する相談',
    '- 司法書士: 登記手続、登記申請書類に関する相談',
    '- 税理士: 税務届出、決算月、会計・経理に関する相談',
  ].join('\n')
}

export default function AdminStartupPrep() {
  const [startupState, setStartupState] = useState(loadStartupState)
  const [questionTarget, setQuestionTarget] = useState('行政書士')
  const [questionText, setQuestionText] = useState('')
  const [copyLabel, setCopyLabel] = useState('コピー')

  const memo = useMemo(() => buildMemo(startupState), [startupState])
  const completedInputs = Object.values(startupState.form).filter((value) => value.trim()).length
  const completedTasks = prepTasks.filter((task) => startupState.tasks[task.id]).length
  const progress = Math.round(((completedInputs + completedTasks) / (Object.keys(emptyForm).length + prepTasks.length)) * 100)

  const updateState = (nextState: StartupState) => {
    setStartupState(nextState)
    window.localStorage.setItem(storageKey, JSON.stringify(nextState))
  }

  const updateField = (key: keyof StartupForm, value: string) => {
    updateState({ ...startupState, form: { ...startupState.form, [key]: value } })
  }

  const toggleTask = (id: string) => {
    updateState({ ...startupState, tasks: { ...startupState.tasks, [id]: !startupState.tasks[id] } })
  }

  const addQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const question = questionText.trim()
    if (!question) return

    updateState({
      ...startupState,
      customQuestions: [...startupState.customQuestions, { target: questionTarget, question }],
    })
    setQuestionText('')
  }

  const removeQuestion = (index: number) => {
    updateState({
      ...startupState,
      customQuestions: startupState.customQuestions.filter((_, itemIndex) => itemIndex !== index),
    })
  }

  const copyMemo = async () => {
    try {
      await navigator.clipboard.writeText(memo)
      setCopyLabel('コピー済み')
    } catch {
      setCopyLabel('選択してコピー')
    }
    window.setTimeout(() => setCopyLabel('コピー'), 1400)
  }

  const downloadMemo = () => {
    const blob = new Blob([memo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = '専門家相談用メモ.txt'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-workspace">
      <div className="admin-page-head">
        <div>
          <p>専門家相談前の整理ツール</p>
          <h1>会社設立準備ノート</h1>
          <span>行政書士・司法書士・税理士へ渡す情報を、提出書類にせず整理します。</span>
        </div>
        <div className="admin-progress">
          <span>入力状況</span>
          <strong>{progress}%</strong>
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="admin-warning">
        <ShieldCheck size={20} />
        <p>
          本機能は、会社設立に向けた情報整理・タスク管理・専門家相談準備を支援するものです。
          定款、登記申請書、各種届出書の作成・提出代行、法的判断、税務判断は行いません。
        </p>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-card-title">
            <ClipboardCheck size={20} />
            <h2>基本情報メモ</h2>
          </div>
          <div className="admin-form-grid">
            <label>
              相談者名
              <input value={startupState.form.contactName} onChange={(event) => updateField('contactName', event.target.value)} placeholder="例：荒川 勝子" />
            </label>
            <label>
              希望する会社形態
              <select value={startupState.form.companyType} onChange={(event) => updateField('companyType', event.target.value)}>
                <option value="">未定</option>
                <option value="株式会社">株式会社</option>
                <option value="合同会社">合同会社</option>
                <option value="その他・専門家に相談">その他・専門家に相談</option>
              </select>
            </label>
            <label className="wide">
              会社名候補メモ
              <textarea value={startupState.form.companyNameCandidates} onChange={(event) => updateField('companyNameCandidates', event.target.value)} placeholder="候補を箇条書きで入力" rows={3} />
            </label>
            <label className="wide">
              事業内容メモ
              <textarea value={startupState.form.businessMemo} onChange={(event) => updateField('businessMemo', event.target.value)} placeholder="やりたい事業、提供予定サービス、将来広げたい領域をメモ" rows={4} />
              <small>そのまま会社目的文にはせず、専門家に確認してもらう前提のメモです。</small>
            </label>
            <label>
              資本金予定額
              <input value={startupState.form.capitalPlan} onChange={(event) => updateField('capitalPlan', event.target.value)} placeholder="例：100万円、未定" />
            </label>
            <label>
              決算月の候補
              <select value={startupState.form.fiscalMonth} onChange={(event) => updateField('fiscalMonth', event.target.value)}>
                <option value="">未定</option>
                {Array.from({ length: 12 }, (_, index) => `${index + 1}月`).map((month) => <option value={month} key={month}>{month}</option>)}
              </select>
            </label>
            <label className="wide">
              本店所在地候補
              <textarea value={startupState.form.addressMemo} onChange={(event) => updateField('addressMemo', event.target.value)} placeholder="自宅、事務所、バーチャルオフィスなどの候補" rows={3} />
            </label>
            <label className="wide">
              役員・出資者の候補
              <textarea value={startupState.form.officersMemo} onChange={(event) => updateField('officersMemo', event.target.value)} placeholder="代表者、役員、出資者候補。未定事項もメモ" rows={3} />
            </label>
            <label className="wide">
              気になること・専門家に伝えたい事情
              <textarea value={startupState.form.specialistNotes} onChange={(event) => updateField('specialistNotes', event.target.value)} placeholder="許認可、共同創業、家族関係、今後の資金調達、税務で気になる点など" rows={4} />
            </label>
          </div>
        </section>

        <aside className="admin-side-stack">
          <section className="admin-card">
            <div className="admin-card-title">
              <ClipboardCheck size={20} />
              <h2>準備タスク</h2>
            </div>
            <div className="admin-task-list">
              {prepTasks.map((task) => (
                <label className="admin-task" key={task.id}>
                  <input type="checkbox" checked={Boolean(startupState.tasks[task.id])} onChange={() => toggleTask(task.id)} />
                  <span>
                    <b>{task.title}</b>
                    <small>{task.desc}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-card-title">
              <FileText size={20} />
              <h2>専門家に聞く質問</h2>
            </div>
            <div className="admin-question-list">
              {questionGroups.map((group) => (
                <article key={group.target}>
                  <h3>{group.target}</h3>
                  <ol>
                    {group.questions.map((question) => <li key={question}>{question}</li>)}
                    {startupState.customQuestions.map((item, index) => item.target === group.target ? (
                      <li className="admin-custom-question" key={`${item.target}-${item.question}`}>
                        <span>{item.question}</span>
                        <button type="button" onClick={() => removeQuestion(index)} aria-label="質問を削除"><Trash2 size={14} /></button>
                      </li>
                    ) : null)}
                  </ol>
                </article>
              ))}
            </div>
            <form className="admin-question-form" onSubmit={addQuestion}>
              <select value={questionTarget} onChange={(event) => setQuestionTarget(event.target.value)} aria-label="相談先">
                <option value="行政書士">行政書士</option>
                <option value="司法書士">司法書士</option>
                <option value="税理士">税理士</option>
              </select>
              <input value={questionText} onChange={(event) => setQuestionText(event.target.value)} placeholder="追加したい質問" />
              <button type="submit"><Plus size={15} /> 追加</button>
            </form>
          </section>
        </aside>
      </div>

      <section className="admin-card memo-admin-card">
        <div className="admin-card-title">
          <FileText size={20} />
          <div>
            <h2>専門家相談用メモ</h2>
            <p>この内容は提出書類ではなく、相談時のヒアリングシートです。</p>
          </div>
        </div>
        <div className="admin-actions">
          <button type="button" onClick={copyMemo}><Copy size={16} /> {copyLabel}</button>
          <button type="button" onClick={downloadMemo}><Download size={16} /> テキスト保存</button>
        </div>
        <textarea className="admin-memo-output" value={memo} readOnly aria-label="専門家相談用メモ" />
      </section>
    </div>
  )
}
