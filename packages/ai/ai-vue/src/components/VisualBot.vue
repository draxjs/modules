<script setup lang="ts">
defineProps<{
  visible: boolean
  speaking: boolean
}>()
</script>

<template>
  <transition name="visual-bot">
    <aside
      v-if="visible"
      class="visual-bot"
      :class="{'visual-bot--speaking': speaking}"
      aria-label="Bot visual"
    >
      <div class="visual-bot__stage">
        <div class="visual-bot__aura visual-bot__aura--outer" />
        <div class="visual-bot__aura visual-bot__aura--inner" />

        <div class="visual-bot__body">
          <div class="visual-bot__face">
            <span class="visual-bot__eye visual-bot__eye--left" />
            <span class="visual-bot__eye visual-bot__eye--right" />
            <span class="visual-bot__mouth" />
          </div>
        </div>

        <div class="visual-bot__waves" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </aside>
  </transition>
</template>

<style scoped>
.visual-bot {
  --visual-bot-scale: 1;

  position: relative;
  align-self: center;
  justify-self: center;
  width: calc(141px * var(--visual-bot-scale));
  height: calc(141px * var(--visual-bot-scale));
  display: grid;
  place-items: center;
  pointer-events: none;
  filter: drop-shadow(0 14px 23px rgba(20, 80, 170, 0.28));
}

.visual-bot__stage {
  position: relative;
  width: 141px;
  height: 141px;
  display: grid;
  place-items: center;
  transform: scale(var(--visual-bot-scale));
}

.visual-bot__aura {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(88, 181, 255, 0.42), rgba(31, 112, 228, 0.1) 58%, transparent 72%);
}

.visual-bot__aura--outer {
  inset: 0;
  animation: visual-bot-float 4.4s ease-in-out infinite;
}

.visual-bot__aura--inner {
  inset: 20px;
  background: radial-gradient(circle, rgba(134, 213, 255, 0.5), rgba(38, 135, 236, 0.18) 62%, transparent 74%);
  animation: visual-bot-pulse 3.2s ease-in-out infinite;
}

.visual-bot__body {
  position: relative;
  width: 72px;
  height: 72px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 21px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.36), transparent 38%),
    linear-gradient(150deg, #82ddff 0%, #2d92f0 46%, #1458cb 100%);
  box-shadow:
    inset 0 1px 15px rgba(255, 255, 255, 0.42),
    0 12px 23px rgba(18, 86, 189, 0.28);
  animation: visual-bot-hover 3.6s ease-in-out infinite;
}

.visual-bot__body::before,
.visual-bot__body::after {
  position: absolute;
  top: 26px;
  width: 12px;
  height: 27px;
  border-radius: 12px;
  background: linear-gradient(180deg, #5fc7ff, #1f72df);
  content: "";
}

.visual-bot__body::before {
  left: -10px;
}

.visual-bot__body::after {
  right: -10px;
}

.visual-bot__face {
  position: absolute;
  inset: 17px 12px 14px;
  border-radius: 15px;
  background: rgba(8, 38, 104, 0.28);
}

.visual-bot__eye {
  position: absolute;
  top: 11px;
  width: 8px;
  height: 11px;
  border-radius: 8px;
  background: #eaf9ff;
  box-shadow: 0 0 9px rgba(210, 246, 255, 0.85);
}

.visual-bot__eye--left {
  left: 13px;
}

.visual-bot__eye--right {
  right: 13px;
}

.visual-bot__mouth {
  position: absolute;
  left: 50%;
  bottom: 9px;
  width: 18px;
  height: 4px;
  border-radius: 8px;
  background: #dff8ff;
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(210, 246, 255, 0.65);
}

.visual-bot__waves {
  position: absolute;
  right: 14px;
  bottom: 29px;
  display: flex;
  align-items: end;
  gap: 3px;
  opacity: 0.34;
}

.visual-bot__waves span {
  width: 4px;
  height: 12px;
  border-radius: 6px;
  background: #c9f4ff;
  transform-origin: bottom;
}

.visual-bot--speaking .visual-bot__body {
  animation: visual-bot-talk 580ms ease-in-out infinite;
}

.visual-bot--speaking .visual-bot__aura--outer {
  animation: visual-bot-speaking-aura 950ms ease-in-out infinite;
}

.visual-bot--speaking .visual-bot__aura--inner {
  animation: visual-bot-speaking-pulse 680ms ease-in-out infinite;
}

.visual-bot--speaking .visual-bot__mouth {
  animation: visual-bot-mouth 220ms ease-in-out infinite;
}

.visual-bot--speaking .visual-bot__waves {
  opacity: 0.92;
}

.visual-bot--speaking .visual-bot__waves span {
  animation: visual-bot-wave 520ms ease-in-out infinite;
}

.visual-bot--speaking .visual-bot__waves span:nth-child(2) {
  animation-delay: 110ms;
}

.visual-bot--speaking .visual-bot__waves span:nth-child(3) {
  animation-delay: 220ms;
}

.visual-bot-enter-active,
.visual-bot-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.visual-bot-enter-from,
.visual-bot-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.94);
}

@keyframes visual-bot-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-7px) scale(1.02);
  }
}

@keyframes visual-bot-hover {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }

  50% {
    transform: translateY(-8px) rotate(1deg);
  }
}

@keyframes visual-bot-pulse {
  0%,
  100% {
    opacity: 0.72;
    transform: scale(1);
  }

  50% {
    opacity: 0.92;
    transform: scale(1.08);
  }
}

@keyframes visual-bot-talk {
  0%,
  100% {
    transform: translateY(-2px) rotate(-2deg) scale(1);
  }

  35% {
    transform: translateY(-10px) rotate(2deg) scale(1.04);
  }

  70% {
    transform: translateY(-5px) rotate(-1deg) scale(0.98);
  }
}

@keyframes visual-bot-speaking-aura {
  0%,
  100% {
    opacity: 0.72;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}

@keyframes visual-bot-speaking-pulse {
  0%,
  100% {
    transform: scale(0.92);
  }

  50% {
    transform: scale(1.16);
  }
}

@keyframes visual-bot-mouth {
  0%,
  100% {
    height: 4px;
    border-radius: 8px;
  }

  50% {
    height: 10px;
    border-radius: 10px;
  }
}

@keyframes visual-bot-wave {
  0%,
  100% {
    transform: scaleY(0.55);
  }

  50% {
    transform: scaleY(1.45);
  }
}

@media (max-width: 700px) {
  .visual-bot {
    --visual-bot-scale: 0.7;
  }
}
</style>
