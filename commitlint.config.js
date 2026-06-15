// Convention Gitmoji du projet : "<emoji|shortcode> | <description>"
// Voir la section « Convention de commits » du README.
const TOKENS = [
  '✨', ':sparkles:',
  '🐛', ':bug:',
  '✅', ':white_check_mark:',
  '🧪', ':test_tube:',
  '♻️', ':recycle:',
  '📝', ':memo:',
  '🎨', ':art:',
  '🔥', ':fire:',
  '⚡️', ':zap:',
  '🚧', ':construction:',
  '➕', ':heavy_plus_sign:',
  '➖', ':heavy_minus_sign:',
  '🔧', ':wrench:',
  '🚀', ':rocket:',
  '🎉', ':tada:',
  '🔀', ':twisted_rightwards_arrows:',
];

// <emoji|shortcode> + " | " + description (lettre initiale, casse libre, sans point final)
const HEADER_PATTERN = new RegExp(`^(?:${TOKENS.join('|')}) \\| \\p{L}.*[^.]$`, 'u');

module.exports = {
  rules: {
    'gitmoji-format': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'gitmoji-format': ({ header }) => [
          typeof header === 'string' && HEADER_PATTERN.test(header),
          'Le message doit suivre le format « <emoji> | <description> » : un emoji Unicode ou son shortcode (ex : 🐛 ou :bug:) de la convention (voir README), un espace, "|", un espace, puis une description sans point final.',
        ],
      },
    },
  ],
};
