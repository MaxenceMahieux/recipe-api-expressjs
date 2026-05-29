// Convention Gitmoji du projet : "<emoji> | <Description>"
// Voir la section « Convention de commits » du README.
const EMOJIS = [
  '✨',
  '🐛',
  '✅',
  '♻️',
  '📝',
  '🎨',
  '🔥',
  '⚡️',
  '🚧',
  '➕',
  '➖',
  '🔧',
  '🚀',
  '🎉',
  '🔀',
];

// <emoji> + " | " + description à l'impératif, majuscule initiale, sans point final.
const HEADER_PATTERN = new RegExp(`^(?:${EMOJIS.join('|')}) \\| \\p{Lu}.*[^.]$`, 'u');

module.exports = {
  rules: {
    'gitmoji-format': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'gitmoji-format': ({ header }) => [
          typeof header === 'string' && HEADER_PATTERN.test(header),
          'Le message doit suivre le format « <emoji> | <Description> » : un emoji de la convention (voir README), un espace, "|", un espace, puis une description à l\'impératif commençant par une majuscule et sans point final.',
        ],
      },
    },
  ],
};
