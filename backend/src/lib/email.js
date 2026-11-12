// Stub de envio de e-mail. Troque pelo provedor real (Resend/Nodemailer) na Release 3.
// Mantido isolado para não travar o CRUD de Personagem (foco da Release 2) por falta de API key.
export async function enviarEmailSessaoMarcada(jogadores, sessao) {
  if (!process.env.RESEND_API_KEY) {
    console.log(
      `[email stub] Sessão em ${sessao.data} ${sessao.hora_inicio}-${sessao.hora_fim} ` +
        `seria notificada para: ${jogadores.map((j) => j.email).join(", ") || "(nenhum jogador)"}`
    );
    return;
  }
  // TODO Release 3: integrar Resend de fato.
}
