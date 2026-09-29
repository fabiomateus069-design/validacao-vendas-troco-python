import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  CircleAlert,
  Info,
  MapPin,
  Pencil,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  StickyNote,
  Trash2,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react';

type PaymentResult = {
  status: 'success' | 'insufficient';
  purchaseCents: number;
  paidCents: number;
  differenceCents: number;
};

type PersonRecord = {
  id: string;
  name: string;
  age: number;
  city: string;
  info: string;
  createdAt: string;
};

type PersonForm = {
  name: string;
  age: string;
  city: string;
  info: string;
};

const PEOPLE_STORAGE_KEY = 'familia-santos-comercial-pessoas';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const inputCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function parseMoneyToCents(value: string): number {
  const cleanValue = value
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .replace(/[^\d,.-]/g, '');

  if (!cleanValue) {
    return 0;
  }

  const hasComma = cleanValue.includes(',');
  const hasDot = cleanValue.includes('.');
  let integerPart = cleanValue;
  let decimalPart = '';

  if (hasComma) {
    const parts = cleanValue.split(',');
    integerPart = parts.slice(0, -1).join('') || parts[0];
    decimalPart = parts.at(-1) ?? '';
  } else if (hasDot) {
    const parts = cleanValue.split('.');
    const lastPart = parts.at(-1) ?? '';
    if (lastPart.length <= 2) {
      integerPart = parts.slice(0, -1).join('');
      decimalPart = lastPart;
    } else {
      integerPart = parts.join('');
    }
  }

  const sign = integerPart.startsWith('-') ? -1 : 1;
  const digits = integerPart.replace(/\D/g, '') || '0';
  const cents = decimalPart.replace(/\D/g, '').slice(0, 2).padEnd(2, '0');

  return sign * (Number(digits) * 100 + Number(cents));
}

function formatInputValue(cents: number): string {
  return inputCurrencyFormatter.format(Math.max(0, cents) / 100);
}

function formatCurrency(cents: number): string {
  return currencyFormatter.format(Math.max(0, cents) / 100);
}

function normalizePersonName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toLocaleUpperCase('pt-BR')}${word.slice(1).toLocaleLowerCase('pt-BR')}`)
    .join(' ');
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toLocaleUpperCase('pt-BR');
  }
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ''}`.toLocaleUpperCase('pt-BR');
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pessoa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStoredPeople(): PersonRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is Partial<PersonRecord> => Boolean(item && typeof item === 'object'))
      .filter((item) => typeof item.name === 'string' && typeof item.age === 'number')
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : createId(),
        name: normalizePersonName(item.name ?? ''),
        age: item.age ?? 0,
        city: typeof item.city === 'string' ? item.city : '',
        info: typeof item.info === 'string' ? item.info : '',
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

const initialPersonForm: PersonForm = {
  name: '',
  age: '',
  city: '',
  info: '',
};

function Home() {
  const [activeView, setActiveView] = useState<'calculator' | 'registry'>('calculator');

  const [purchaseValue, setPurchaseValue] = useState('');
  const [paidValue, setPaidValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const [result, setResult] = useState<PaymentResult | null>(null);

  const [people, setPeople] = useState<PersonRecord[]>(readStoredPeople);
  const [personForm, setPersonForm] = useState<PersonForm>(initialPersonForm);
  const [personFormError, setPersonFormError] = useState('');
  const [personFeedback, setPersonFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const purchaseCents = parseMoneyToCents(purchaseValue);
  const paidCents = parseMoneyToCents(paidValue);

  const filteredPeople = useMemo(() => {
    const query = normalizeSearch(searchTerm);
    if (!query) {
      return people;
    }
    return people.filter((person) => normalizeSearch(person.name).includes(query));
  }, [people, searchTerm]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people));
    } catch {
      setPersonFeedback('Não foi possível salvar os cadastros neste navegador.');
    }
  }, [people]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError('');

    if (purchaseCents <= 0 && paidCents <= 0) {
      setValidationError('Informe o valor da compra e o valor recebido.');
      setResult(null);
      return;
    }

    if (purchaseCents <= 0) {
      setValidationError('Informe um valor de compra maior que zero.');
      setResult(null);
      return;
    }

    if (paidCents <= 0) {
      setValidationError('Informe quanto o cliente entregou.');
      setResult(null);
      return;
    }

    setResult({
      status: paidCents >= purchaseCents ? 'success' : 'insufficient',
      purchaseCents,
      paidCents,
      differenceCents: Math.abs(paidCents - purchaseCents),
    });
  }

  function handleClear() {
    setPurchaseValue('');
    setPaidValue('');
    setValidationError('');
    setResult(null);
  }

  function addToPaidValue(centsToAdd: number) {
    const currentCents = Math.max(0, parseMoneyToCents(paidValue));
    setPaidValue(formatInputValue(currentCents + centsToAdd));
    setValidationError('');
  }

  function handleInputChange(value: string, setter: (nextValue: string) => void) {
    setter(value.replace(/[^\d,.-]/g, ''));
    setValidationError('');
    setResult(null);
  }

  function formatInputOnBlur(value: string, setter: (nextValue: string) => void) {
    const cents = parseMoneyToCents(value);
    if (cents > 0) {
      setter(formatInputValue(cents));
    }
  }

  function updatePersonField(field: keyof PersonForm, value: string) {
    setPersonForm((current) => ({ ...current, [field]: value }));
    setPersonFormError('');
    setPersonFeedback('');
  }

  function resetPersonForm() {
    setPersonForm(initialPersonForm);
    setEditingPersonId(null);
    setPersonFormError('');
  }

  function handlePersonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = normalizePersonName(personForm.name);
    const age = Number(personForm.age);

    if (normalizedName.length < 2) {
      setPersonFormError('Informe o nome completo ou um nome com pelo menos 2 caracteres.');
      return;
    }

    if (!personForm.age.trim() || !Number.isInteger(age) || age < 0 || age > 130) {
      setPersonFormError('Informe uma idade inteira entre 0 e 130 anos.');
      return;
    }

    const city = personForm.city.trim().replace(/\s+/g, ' ');
    const info = personForm.info.trim();

    if (editingPersonId) {
      setPeople((current) =>
        current.map((person) =>
          person.id === editingPersonId
            ? { ...person, name: normalizedName, age, city, info }
            : person,
        ),
      );
      setPersonFeedback(`${normalizedName} foi atualizado(a) com sucesso.`);
    } else {
      setPeople((current) => [
        {
          id: createId(),
          name: normalizedName,
          age,
          city,
          info,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setPersonFeedback(`${normalizedName} foi adicionado(a) à lista.`);
    }

    resetPersonForm();
  }

  function startEditing(person: PersonRecord) {
    setEditingPersonId(person.id);
    setPersonForm({
      name: person.name,
      age: String(person.age),
      city: person.city,
      info: person.info,
    });
    setPersonFormError('');
    setPersonFeedback('');
    setActiveView('registry');
  }

  function removePerson(id: string) {
    const removedPerson = people.find((person) => person.id === id);
    setPeople((current) => current.filter((person) => person.id !== id));
    setConfirmingDeleteId(null);
    setPersonFeedback(removedPerson ? `${removedPerson.name} foi removido(a).` : 'Cadastro removido.');
    if (editingPersonId === id) {
      resetPersonForm();
    }
  }

  const isEditing = Boolean(editingPersonId);

  return (
    <main className="app-shell">
      <div className="page-frame">
        <header className="topbar">
          <div className="brand-lockup" data-testid="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              FS
            </div>
            <div>
              <p className="brand-name">Família Santos</p>
              <p className="brand-caption">Comercial</p>
            </div>
          </div>

          <nav className="view-nav" aria-label="Áreas do Comercial">
            <button
              className={`view-nav-button ${activeView === 'calculator' ? 'active' : ''}`}
              type="button"
              data-testid="button-nav-calculator"
              aria-current={activeView === 'calculator' ? 'page' : undefined}
              onClick={() => setActiveView('calculator')}
            >
              <ReceiptText size={16} aria-hidden="true" />
              Caixa
            </button>
            <button
              className={`view-nav-button ${activeView === 'registry' ? 'active' : ''}`}
              type="button"
              data-testid="button-nav-registry"
              aria-current={activeView === 'registry' ? 'page' : undefined}
              onClick={() => setActiveView('registry')}
            >
              <Users size={16} aria-hidden="true" />
              Pessoas
            </button>
          </nav>

          <div className="session-note" data-testid="status-session">
            <span className="session-dot" aria-hidden="true" />
            Caixa pronto para usar
          </div>
        </header>

        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow" data-testid="status-active-view">
              {activeView === 'calculator' ? 'Conferência de caixa' : 'Caderno de pessoas'}
            </p>
            <h1 className="page-title" id="page-title">
              {activeView === 'calculator' ? (
                <>
                  Venda conferida, <em>troco tranquilo.</em>
                </>
              ) : (
                <>
                  Gente conhecida, <em>atendimento próximo.</em>
                </>
              )}
            </h1>
          </div>
          <p className="intro-copy">
            {activeView === 'calculator'
              ? 'Digite os valores da compra e do pagamento. A gente faz a conta certinha para você finalizar cada atendimento com segurança.'
              : 'Guarde os dados de quem passa por aqui. Um cadastro simples para lembrar nomes, histórias e detalhes importantes do balcão.'}
          </p>
        </section>

        {activeView === 'calculator' ? (
          <section className="calculator-card" aria-label="Calculadora de troco">
            <form className="sale-form-panel" onSubmit={handleSubmit} noValidate>
              <p className="panel-kicker">Nova venda</p>
              <h2 className="panel-title">Quanto ficou a compra?</h2>
              <p className="panel-description">Use reais e centavos. Por exemplo: 18,90.</p>

              <div className="field-group">
                <label className="field-label" htmlFor="purchase-amount">
                  Valor da compra
                  <span className="field-hint">Obrigatório</span>
                </label>
                <div className="currency-input-wrap">
                  <span className="currency-prefix" aria-hidden="true">
                    R$
                  </span>
                  <input
                    className="currency-input"
                    id="purchase-amount"
                    data-testid="input-purchase-amount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0,00"
                    value={purchaseValue}
                    aria-invalid={Boolean(validationError && purchaseCents <= 0)}
                    onChange={(event) => handleInputChange(event.target.value, setPurchaseValue)}
                    onBlur={() => formatInputOnBlur(purchaseValue, setPurchaseValue)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="paid-amount">
                  Valor recebido
                  <span className="field-hint">Obrigatório</span>
                </label>
                <div className="currency-input-wrap">
                  <span className="currency-prefix" aria-hidden="true">
                    R$
                  </span>
                  <input
                    className="currency-input"
                    id="paid-amount"
                    data-testid="input-paid-amount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0,00"
                    value={paidValue}
                    aria-invalid={Boolean(validationError && paidCents <= 0)}
                    onChange={(event) => handleInputChange(event.target.value, setPaidValue)}
                    onBlur={() => formatInputOnBlur(paidValue, setPaidValue)}
                  />
                </div>
              </div>

              <div className="quick-add" aria-label="Adicionar valor recebido">
                <span className="quick-add-label">Atalhos:</span>
                {[5, 10, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    className="quick-add-button"
                    type="button"
                    data-testid={`button-add-paid-${amount}`}
                    onClick={() => addToPaidValue(amount * 100)}
                  >
                    + R$ {amount}
                  </button>
                ))}
              </div>

              {validationError ? (
                <p className="validation-message" data-testid="status-validation" role="alert">
                  <CircleAlert size={15} aria-hidden="true" />
                  {validationError}
                </p>
              ) : null}

              <div className="form-actions">
                <button className="primary-action" type="submit" data-testid="button-submit-sale">
                  Conferir pagamento
                  <ArrowRight size={17} strokeWidth={2.3} aria-hidden="true" />
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  aria-label="Limpar venda"
                  data-testid="button-clear-sale"
                  onClick={handleClear}
                >
                  <RotateCcw size={17} aria-hidden="true" />
                </button>
              </div>
            </form>

            <aside className="result-panel" aria-live="polite">
              <div className="result-content">
                <div className="result-label">
                  <span className="result-label-line" aria-hidden="true" />
                  Resultado da conferência
                </div>

                {!result ? (
                  <div className="empty-result" data-testid="status-empty">
                    <div className="empty-icon" aria-hidden="true">
                      <ReceiptText size={25} strokeWidth={1.6} />
                    </div>
                    <h2 className="result-title">Pronto para a próxima conta.</h2>
                    <p className="result-copy">
                      O valor do troco aparece aqui assim que você conferir o pagamento.
                    </p>
                  </div>
                ) : (
                  <div
                    className={`result-card ${result.status}`}
                    data-testid={`status-payment-${result.status}`}
                  >
                    <div className="result-card-heading">
                      <div className="result-state-icon" aria-hidden="true">
                        {result.status === 'success' ? (
                          <Check size={20} strokeWidth={2.7} />
                        ) : (
                          <CircleAlert size={20} strokeWidth={2.4} />
                        )}
                      </div>
                      <h2 className="result-card-title">
                        {result.status === 'success' ? 'Pagamento certo.' : 'Ainda falta um pouco.'}
                      </h2>
                    </div>
                    <p className="result-card-copy">
                      {result.status === 'success'
                        ? 'Confira o valor abaixo e pode concluir a venda com tranquilidade.'
                        : 'O valor recebido ainda não cobre a compra. Combine o restante com o cliente.'}
                    </p>
                    <div className="change-display">
                      <span className="change-display-label">
                        {result.status === 'success' ? 'Troco a devolver' : 'Valor que falta'}
                      </span>
                      <strong
                        className="change-display-value"
                        data-testid={
                          result.status === 'success'
                            ? 'text-change-amount'
                            : 'text-shortfall-amount'
                        }
                      >
                        {formatCurrency(result.differenceCents)}
                      </strong>
                    </div>
                    <div className="summary-strip">
                      <div className="summary-item">
                        Compra
                        <strong data-testid="text-summary-purchase">
                          {formatCurrency(result.purchaseCents)}
                        </strong>
                      </div>
                      <div className="summary-item">
                        Recebido
                        <strong data-testid="text-summary-paid">
                          {formatCurrency(result.paidCents)}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </section>
        ) : (
          <section className="registry-layout" aria-label="Cadastro de pessoas" data-testid="section-person-registry">
            <div className="registry-form-card">
              <div className="registry-card-heading">
                <div>
                  <p className="panel-kicker">{isEditing ? 'Editar cadastro' : 'Novo cadastro'}</p>
                  <h2 className="registry-card-title">
                    {isEditing ? 'Ajuste os detalhes.' : 'Quem passou por aqui?'}
                  </h2>
                  <p className="registry-card-copy">
                    {isEditing
                      ? 'Atualize o que mudou e mantenha a lista em dia.'
                      : 'Nome e idade bastam para começar. O resto fica no seu tempo.'}
                  </p>
                </div>
                <div className="form-icon-badge" aria-hidden="true">
                  {isEditing ? <Pencil size={19} /> : <UserRoundPlus size={20} />}
                </div>
              </div>

              <form className="registry-form" onSubmit={handlePersonSubmit} noValidate>
                <div className="field-group">
                  <label className="field-label" htmlFor="person-name">
                    Nome
                    <span className="field-hint">Obrigatório</span>
                  </label>
                  <input
                    className="text-input"
                    id="person-name"
                    data-testid="input-person-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Ex.: Maria Santos"
                    value={personForm.name}
                    aria-invalid={Boolean(personFormError && personForm.name.trim().length < 2)}
                    onChange={(event) => updatePersonField('name', event.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="person-age">
                    Idade
                    <span className="field-hint">Obrigatório</span>
                  </label>
                  <input
                    className="text-input"
                    id="person-age"
                    data-testid="input-person-age"
                    type="number"
                    min="0"
                    max="130"
                    step="1"
                    inputMode="numeric"
                    placeholder="Ex.: 42"
                    value={personForm.age}
                    aria-invalid={Boolean(personFormError && (!personForm.age || Number(personForm.age) > 130))}
                    onChange={(event) => updatePersonField('age', event.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="person-city">
                    Cidade
                    <span className="field-hint">Opcional</span>
                  </label>
                  <input
                    className="text-input"
                    id="person-city"
                    data-testid="input-person-city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Ex.: Feira de Santana"
                    value={personForm.city}
                    onChange={(event) => updatePersonField('city', event.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="person-info">
                    Informações extras
                    <span className="field-hint">Opcional</span>
                  </label>
                  <textarea
                    className="textarea-input"
                    id="person-info"
                    data-testid="input-person-info"
                    placeholder="Preferências, recados ou qualquer detalhe útil."
                    value={personForm.info}
                    onChange={(event) => updatePersonField('info', event.target.value)}
                  />
                </div>

                {personFormError ? (
                  <p className="validation-message" data-testid="status-registry-validation" role="alert">
                    <CircleAlert size={15} aria-hidden="true" />
                    {personFormError}
                  </p>
                ) : null}

                {personFeedback ? (
                  <p className="registry-feedback success-feedback" data-testid="status-registry-feedback" role="status">
                    <Check size={15} aria-hidden="true" />
                    {personFeedback}
                  </p>
                ) : null}

                <div className="registry-form-actions">
                  <button
                    className="primary-action"
                    type="submit"
                    data-testid={isEditing ? 'button-update-person' : 'button-add-person'}
                  >
                    {isEditing ? 'Salvar alterações' : 'Adicionar pessoa'}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                  {isEditing ? (
                    <button
                      className="secondary-action"
                      type="button"
                      data-testid="button-cancel-edit-person"
                      aria-label="Cancelar edição"
                      onClick={resetPersonForm}
                    >
                      <X size={17} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="registry-list-card">
              <div className="registry-list-heading">
                <div className="registry-card-heading">
                  <div>
                    <p className="panel-kicker">Lista local</p>
                    <h2 className="registry-card-title">Pessoas cadastradas</h2>
                  </div>
                </div>
                <span className="registry-count" data-testid="text-person-count">
                  {people.length} {people.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>

              <div className="search-wrap">
                <Search size={17} aria-hidden="true" />
                <label className="sr-only" htmlFor="person-search">
                  Buscar pessoa pelo nome
                </label>
                <input
                  className="search-input"
                  id="person-search"
                  data-testid="input-search-person"
                  type="search"
                  placeholder="Buscar pelo nome..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              {people.length === 0 ? (
                <div className="empty-registry" data-testid="status-empty-registry">
                  <div>
                    <div className="empty-registry-icon" aria-hidden="true">
                      <UserRound size={21} />
                    </div>
                    <h3 className="empty-registry-title">A lista ainda está vazia.</h3>
                    <p className="empty-registry-copy">
                      Cadastre a primeira pessoa ao lado para deixar o atendimento mais pessoal.
                    </p>
                  </div>
                </div>
              ) : filteredPeople.length === 0 ? (
                <p className="no-search-results" data-testid="status-no-search-results">
                  Nenhuma pessoa encontrada para “{searchTerm}”.
                </p>
              ) : (
                <div className="people-list" data-testid="list-people">
                  {filteredPeople.map((person) => (
                    <article className="person-record" key={person.id} data-testid={`card-person-${person.id}`}>
                      <div className="person-main">
                        <div className="person-initials" aria-hidden="true">
                          {getInitials(person.name)}
                        </div>
                        <div>
                          <h3 className="person-name" data-testid={`text-person-name-${person.id}`}>
                            {person.name}
                          </h3>
                          <div className="person-meta">
                            <span data-testid={`text-person-age-${person.id}`}>{person.age} anos</span>
                            {person.city ? (
                              <span data-testid={`text-person-city-${person.id}`}>
                                <MapPin size={13} aria-hidden="true" />
                                {person.city}
                              </span>
                            ) : null}
                            <span data-testid={`text-person-created-${person.id}`}>
                              {dateFormatter.format(new Date(person.createdAt))}
                            </span>
                          </div>
                          {person.info ? (
                            <p className="person-info" data-testid={`text-person-info-${person.id}`}>
                              <StickyNote size={13} aria-hidden="true" /> {person.info}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="person-actions">
                        <button
                          className="icon-action"
                          type="button"
                          data-testid={`button-edit-person-${person.id}`}
                          aria-label={`Editar ${person.name}`}
                          onClick={() => startEditing(person)}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          className="icon-action danger"
                          type="button"
                          data-testid={`button-delete-person-${person.id}`}
                          aria-label={`Excluir ${person.name}`}
                          onClick={() => setConfirmingDeleteId(person.id)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>

                      {confirmingDeleteId === person.id ? (
                        <div className="delete-confirmation" data-testid={`status-delete-confirm-${person.id}`}>
                          <span>Excluir este cadastro?</span>
                          <div className="delete-confirmation-actions">
                            <button
                              className="mini-action"
                              type="button"
                              data-testid={`button-cancel-delete-${person.id}`}
                              onClick={() => setConfirmingDeleteId(null)}
                            >
                              Cancelar
                            </button>
                            <button
                              className="mini-action confirm"
                              type="button"
                              data-testid={`button-confirm-delete-${person.id}`}
                              onClick={() => removePerson(person.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="footer-note">
          <span>
            <ShieldCheck size={14} aria-hidden="true" /> Conferência local, sem envio de dados.
          </span>
          <span>
            <Info size={14} aria-hidden="true" /> Valores em <strong>BRL</strong>
          </span>
        </footer>
      </div>
    </main>
  );
}

export default Home;