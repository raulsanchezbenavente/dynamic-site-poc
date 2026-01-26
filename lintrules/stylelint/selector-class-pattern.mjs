import stylelint from 'stylelint';

const ruleName = 'custom/selector-class-pattern';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'Selector class pattern failed.',
});

const rule = () => (root, result) => {
  void root;
  void result;
};

export default stylelint.createPlugin(ruleName, rule);
export { ruleName, messages };
