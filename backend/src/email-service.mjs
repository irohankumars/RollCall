export function createEmailService(config, transport) {
  const send = transport?.send ?? (async (message) => {
    if (config.nodeEnv === 'production') throw new Error('Email transport is not configured.');
    console.info(`[development email] ${message.subject} -> ${message.to}`);
  });
  return {
    invitation(to, collegeName, activationUrl) {
      return send({ to, subject: `Activate your ${collegeName} RollCall workspace`, text: `Your workspace is ready. Activate your College Admin account: ${activationUrl}` });
    },
    otp(to, code) { return send({ to, subject: 'Your RollCall verification code', text: `Your RollCall verification code is ${code}. It expires shortly.` }); },
  };
}
