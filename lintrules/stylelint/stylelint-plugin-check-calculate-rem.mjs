import stylelint from 'stylelint';

const ruleName = 'custom/no-calculateRem-without-interpolation';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'calculateRem must be used with interpolation.',
});

const rule = () => (root, result) => {
  void root;
  void result;
};

export default stylelint.createPlugin(ruleName, rule);
export { ruleName, messages };
