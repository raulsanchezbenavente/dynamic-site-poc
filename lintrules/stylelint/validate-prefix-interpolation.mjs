import stylelint from 'stylelint';

const ruleName = 'custom/require-prefix-interpolation';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'Prefix interpolation is required.',
});

const rule = () => (root, result) => {
  void root;
  void result;
};

export default stylelint.createPlugin(ruleName, rule);
export { ruleName, messages };
