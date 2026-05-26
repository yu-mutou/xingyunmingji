const DIM_META = {
  career: { name: '事业', icon: '💼' },
  wealth: { name: '财运', icon: '💰' },
  love: { name: '感情', icon: '💕' },
  health: { name: '健康', icon: '🏃' },
  academics: { name: '学业', icon: '📚' },
  interpersonal: { name: '人际', icon: '🤝' },
};

const DIM_KEYS = ['career', 'wealth', 'love', 'health', 'academics', 'interpersonal'];

function barColor(score) {
  if (score >= 70) return '#52C41A';
  if (score >= 50) return '#FFD700';
  return '#F53F3F';
}

Component({
  properties: {
    visible: { type: Boolean, value: false },
    fortuneData: { type: Object, value: {} },
    userProfile: { type: Object, value: {} },
  },

  data: {
    posterUrl: '',
    generateFailed: false,
    dimPreview: [],
  },

  observers: {
    visible(val) {
      if (val && this.properties.fortuneData && this.properties.fortuneData.date) {
        this.setData({ posterUrl: '', generateFailed: false });
        this.buildDimPreview();
        this.generatePoster();
      }
    },
  },

  methods: {
    buildDimPreview() {
      const fortune = this.properties.fortuneData || {};
      const dims = fortune.dimensions || {};
      const preview = DIM_KEYS.map(key => ({
        key,
        name: DIM_META[key].name,
        icon: DIM_META[key].icon,
        score: dims[key] ? dims[key].score : 0,
        barColor: barColor(dims[key] ? dims[key].score : 0),
      }));
      this.setData({ dimPreview: preview });
    },

    generatePoster() {
      const ctx = this;
      const fortune = ctx.properties.fortuneData || {};
      const profile = ctx.properties.userProfile || {};

      const timeout = setTimeout(() => {
        if (!ctx.data.posterUrl && !ctx.data.generateFailed) {
          ctx.setData({ generateFailed: true });
        }
      }, 5000);

      // Use this.createSelectorQuery() for component-scoped canvas lookup
      const query = this.createSelectorQuery();
      query
        .select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) {
            clearTimeout(timeout);
            ctx.setData({ generateFailed: true });
            return;
          }

          try {
            const canvas = res[0].node;
            const c = canvas.getContext('2d');
            const dpr = wx.getSystemInfoSync().pixelRatio || 2;
            const W = 375, H = 560;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            c.scale(dpr, dpr);

            const lc = fortune.levelColor || '#FFD700';
            const dims = fortune.dimensions || {};
            const lucky = fortune.luckyInfo || {};

            // === Background: paper white with subtle texture ===
            c.fillStyle = '#FFFDF9';
            c.fillRect(0, 0, W, H);

            // Subtle irregular border
            c.strokeStyle = 'rgba(0,0,0,0.06)';
            c.lineWidth = 0.8;
            c.beginPath();
            // Slightly wobbly border for hand-drawn feel
            const b = 8;
            c.moveTo(b + 2, b); c.lineTo(W - b - 1, b + 1);
            c.lineTo(W - b, H - b + 2); c.lineTo(b + 1, H - b - 1);
            c.closePath();
            c.stroke();

            // === Title area: thin purple accent line ===
            c.strokeStyle = '#7B61FF';
            c.lineWidth = 2.5;
            c.beginPath();
            c.moveTo(28, 38); c.lineTo(28, 62);
            c.stroke();

            // === Top: user info + badge ===
            // Avatar circle
            if (profile.avatarUrl) {
              c.save();
              c.beginPath();
              c.arc(52, 48, 16, 0, Math.PI * 2);
              c.clip();
              c.fillStyle = '#F5F2EC';
              c.fill();
              c.restore();
              c.strokeStyle = 'rgba(0,0,0,0.1)';
              c.lineWidth = 1;
              c.beginPath();
              c.arc(52, 48, 16, 0, Math.PI * 2);
              c.stroke();
            }

            // Nickname
            c.fillStyle = '#2D2D2D';
            c.font = '16px sans-serif';
            c.textAlign = 'left';
            c.fillText(profile.nickname || '星运用户', 78, 50);

            // Date
            c.fillStyle = '#B0B0B0';
            c.font = '11px sans-serif';
            c.fillText(fortune.date || '', 78, 66);

            // Level badge
            const badgeW = 56, badgeH = 24;
            const badgeX = W - 42 - badgeW, badgeY = 38;
            c.fillStyle = lc;
            c.beginPath();
            c.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
            c.fill();
            c.fillStyle = '#fff';
            c.font = '13px sans-serif';
            c.textAlign = 'center';
            c.fillText(fortune.level || '', badgeX + badgeW / 2, badgeY + badgeH / 2 + 4);

            // === Score circle ===
            const scY = 145;
            c.beginPath();
            c.arc(W / 2, scY, 50, 0, Math.PI * 2);
            c.fillStyle = 'rgba(123, 97, 255, 0.03)';
            c.fill();
            c.strokeStyle = lc;
            c.lineWidth = 3;
            c.stroke();

            c.fillStyle = lc;
            c.font = '56px sans-serif';
            c.textAlign = 'center';
            c.fillText(String(fortune.overallScore || 0), W / 2, scY + 6);

            c.fillStyle = '#B0B0B0';
            c.font = '13px sans-serif';
            c.fillText('综合运势', W / 2, scY + 40);

            // === Divider line ===
            const divY = 212;
            c.strokeStyle = 'rgba(0,0,0,0.06)';
            c.lineWidth = 0.5;
            c.beginPath();
            c.moveTo(40, divY);
            c.lineTo(W - 40, divY);
            c.stroke();

            // === Dimensions ===
            const dimStartY = 234;
            DIM_KEYS.forEach((key, i) => {
              const y = dimStartY + i * 32;
              const d = dims[key] || { score: 0 };
              const meta = DIM_META[key];
              const bc = barColor(d.score);

              // Name
              c.fillStyle = '#2D2D2D';
              c.font = '14px sans-serif';
              c.textAlign = 'left';
              c.fillText(`${meta.icon}  ${meta.name}`, 40, y + 12);

              // Bar bg
              const barX = 130, barW = 160, barH = 5;
              c.fillStyle = '#EFEDE8';
              c.beginPath();
              c.roundRect(barX, y + 9, barW, barH, 2.5);
              c.fill();

              // Bar fill
              c.fillStyle = bc;
              c.beginPath();
              c.roundRect(barX, y + 9, Math.max(barW * d.score / 100, barH), barH, 2.5);
              c.fill();

              // Score number
              c.fillStyle = bc;
              c.font = 'bold 15px sans-serif';
              c.textAlign = 'right';
              c.fillText(String(d.score), W - 40, y + 14);
            });

            // === Divider ===
            const divY2 = dimStartY + DIM_KEYS.length * 32 + 12;
            c.strokeStyle = 'rgba(0,0,0,0.06)';
            c.lineWidth = 0.5;
            c.beginPath();
            c.moveTo(40, divY2);
            c.lineTo(W - 40, divY2);
            c.stroke();

            // === Lucky info ===
            const luckyY = divY2 + 22;
            const colorName = (lucky.color && lucky.color.name) || '';
            const colorHex = (lucky.color && lucky.color.hex) || '#fff';

            // Lucky color swatch
            c.fillStyle = colorHex;
            c.beginPath();
            c.arc(68, luckyY + 6, 12, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = '#EBE8E2';
            c.lineWidth = 1;
            c.stroke();

            c.fillStyle = '#7A7A7A';
            c.font = '11px sans-serif';
            c.textAlign = 'center';
            c.fillText(`幸运色 · ${colorName}`, 68, luckyY + 28);

            // Lucky number
            c.fillStyle = '#2D2D2D';
            c.font = 'bold 28px sans-serif';
            c.fillText(String(lucky.number || ''), W / 2, luckyY + 10);
            c.fillStyle = '#7A7A7A';
            c.font = '11px sans-serif';
            c.fillText('幸运数字', W / 2, luckyY + 28);

            // Lucky direction
            c.fillStyle = '#7A7A7A';
            c.font = '11px sans-serif';
            c.textAlign = 'center';
            c.fillText('🧭', W - 68, luckyY + 8);
            c.fillText(`方位 · ${lucky.direction || ''}`, W - 68, luckyY + 28);

            // === Footer ===
            c.strokeStyle = 'rgba(0,0,0,0.06)';
            c.lineWidth = 0.5;
            c.beginPath();
            c.moveTo(W / 2 - 50, H - 28);
            c.lineTo(W / 2 + 50, H - 28);
            c.stroke();

            c.fillStyle = '#B0B0B0';
            c.font = '10px sans-serif';
            c.textAlign = 'center';
            c.fillText('星运铭记 · 每日好运相伴', W / 2, H - 12);

            // === Export ===
            wx.canvasToTempFilePath({
              canvas,
              success: (res) => {
                clearTimeout(timeout);
                ctx.setData({ posterUrl: res.tempFilePath });
                // Store for sharing
                const app = getApp();
                app.globalData.posterShareUrl = res.tempFilePath;
              },
              fail: (err) => {
                clearTimeout(timeout);
                console.error('canvasToTempFilePath fail:', err);
                ctx.setData({ generateFailed: true });
              },
            });
          } catch (e) {
            clearTimeout(timeout);
            console.error('Canvas generation error:', e);
            ctx.setData({ generateFailed: true });
          }
        });
    },

    onSaveTap() {
      const url = this.data.posterUrl;
      if (!url) return;

      wx.saveImageToPhotosAlbum({
        filePath: url,
        success: () => {
          wx.showToast({ title: '保存成功', icon: 'success' });
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('auth deny')) {
            wx.showModal({
              title: '提示',
              content: '需要相册权限才能保存图片，请前往设置开启',
              success: (res) => {
                if (res.confirm) wx.openSetting();
              },
            });
          } else {
            wx.showToast({ title: '保存失败，请在真机上重试', icon: 'none' });
          }
        },
      });
    },

    onCloseTap() {
      this.setData({ posterUrl: '', generateFailed: false });
      this.triggerEvent('onClose');
    },
  },
});
