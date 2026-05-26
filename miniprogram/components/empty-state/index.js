Component({
  properties: {
    message: { type: String, value: '暂无内容' },
    buttonText: { type: String, value: '' },
  },
  methods: {
    onActionTap() {
      this.triggerEvent('onAction');
    },
  },
});
