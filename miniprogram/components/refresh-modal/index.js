Component({
  properties: {
    visible: { type: Boolean, value: false },
    canRefresh: { type: Boolean, value: true },
  },
  methods: {
    onConfirmTap() {
      if (this.properties.canRefresh) {
        this.triggerEvent('onConfirm');
      }
    },
    onCancelTap() {
      this.triggerEvent('onCancel');
    },
  },
});
