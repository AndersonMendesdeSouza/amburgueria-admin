import { useEffect, useMemo, useState } from "react";
import { SystemSettingsService } from "../../service/system-settings.service";
import type { SystemSettingsResponse } from "../../dtos/response/system-settings-response.dto";
import styles from "./Config.module.css";
import { FiExternalLink } from "react-icons/fi";

const TIMEZONES = ["America/Sao_Paulo", "America/Manaus", "America/Belem"];

function normalizeTime(time: string) {
  return time.slice(0, 5);
}

export function Config() {
  const [settings, setSettings] = useState<SystemSettingsResponse | null>(null);
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("17:00");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const statusText = useMemo(() => {
    if (!settings) return "Carregando";
    if (settings.available) return "Loja aberta";
    return "Loja fechada";
  }, [settings]);

  useEffect(() => {
    async function loadSettings() {
      try {
        setError("");
        const data = await SystemSettingsService.findSettings();
        setSettings(data);
        setOpeningTime(normalizeTime(data.openingTime));
        setClosingTime(normalizeTime(data.closingTime));
        setTimezone(data.timezone);
        setOrdersEnabled(data.ordersEnabled);
      } catch {
        setError("Não foi possível carregar as configurações.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    if (openingTime >= closingTime) {
      setSuccess("");
      setError("O horário de abertura deve ser menor que o de fechamento.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await SystemSettingsService.updateSettings({
        openingTime,
        closingTime,
        timezone,
        ordersEnabled,
      });

      setSettings(data);
      setOpeningTime(normalizeTime(data.openingTime));
      setClosingTime(normalizeTime(data.closingTime));
      setTimezone(data.timezone);
      setOrdersEnabled(data.ordersEnabled);
      setSuccess("Horário de funcionamento salvo com sucesso.");
    } catch {
      setError("Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Configurações</p>
          <h2 className={styles.title}>Horário de funcionamento</h2>
          <p className={styles.subtitle}>
            Defina o período em que a loja aceita pedidos e controle se os
            pedidos ficam ativos no cardápio.
          </p>
        </div>

        <div className={styles.headerActions}>
          <a
            className={styles.siteLink}
            href="https://amburgueria-site.vercel.app/main"
            target="_blank"
            rel="noreferrer"
          >
            Acessar site
            <FiExternalLink aria-hidden />
          </a>

          <span
            className={`${styles.statusPill} ${
              settings?.available ? "" : styles.statusPillClosed
            }`}
          >
            <span className={styles.statusDot} />
            {statusText}
          </span>
        </div>
      </div>

      <section className={styles.panel}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {loading ? (
            <p className={styles.info}>Carregando configurações...</p>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Abertura</span>
              <input
                className={styles.input}
                type="time"
                value={openingTime}
                onChange={(event) => setOpeningTime(event.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Fechamento</span>
              <input
                className={styles.input}
                type="time"
                value={closingTime}
                onChange={(event) => setClosingTime(event.target.value)}
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Fuso horário</span>
            <select
              className={styles.select}
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            >
              {TIMEZONES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.toggleLine}>
            <div>
              <strong className={styles.toggleTitle}>Aceitar pedidos</strong>
              <span className={styles.toggleText}>
                Quando desligado, a API informa que os pedidos estão
                temporariamente desativados.
              </span>
            </div>

            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={ordersEnabled}
                onChange={(event) => setOrdersEnabled(event.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          {settings?.reason ? (
            <p className={styles.info}>{settings.reason}</p>
          ) : null}

          <div className={styles.actions}>
            <button
              className={styles.button}
              type="submit"
              disabled={loading || saving}
            >
              {saving ? "Salvando..." : "Salvar horário"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
