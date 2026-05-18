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
      class="visual-bot jarvis-bot"
      :class="{'jarvis-bot--speaking': speaking}"
      aria-label="Bot visual Jarvis"
    >
      <div class="jarvis-bot__stage">
        <div class="jarvis-bot__halo jarvis-bot__halo--outer" />
        <div class="jarvis-bot__halo jarvis-bot__halo--middle" />
        <div class="jarvis-bot__scan" />

        <div class="jarvis-bot__core">
          <span class="jarvis-bot__reactor" />
          <span class="jarvis-bot__reactor-ring jarvis-bot__reactor-ring--one" />
          <span class="jarvis-bot__reactor-ring jarvis-bot__reactor-ring--two" />
          <span class="jarvis-bot__line jarvis-bot__line--top" />
          <span class="jarvis-bot__line jarvis-bot__line--bottom" />
        </div>

        <div class="jarvis-bot__equalizer" aria-hidden="true">
          <span />
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
  filter:
    drop-shadow(0 16px 22px rgba(23, 177, 255, 0.22))
    drop-shadow(0 0 16px rgba(255, 186, 93, 0.18));
}

.jarvis-bot__stage {
  position: relative;
  width: 141px;
  height: 141px;
  display: grid;
  place-items: center;
  transform: scale(var(--visual-bot-scale));
}

.jarvis-bot__halo,
.jarvis-bot__scan {
  position: absolute;
  border-radius: 50%;
}

.jarvis-bot__halo--outer {
  inset: 2px;
  border: 1px solid rgba(95, 217, 255, 0.62);
  background:
    conic-gradient(from 42deg, transparent 0 20deg, rgba(95, 217, 255, 0.66) 28deg 42deg, transparent 50deg 142deg, rgba(255, 194, 104, 0.72) 150deg 164deg, transparent 174deg 360deg),
    radial-gradient(circle, rgba(39, 194, 255, 0.22), transparent 66%);
  animation: jarvis-bot-spin 8s linear infinite;
}

.jarvis-bot__halo--middle {
  inset: 19px;
  border: 2px solid rgba(255, 191, 99, 0.64);
  background:
    radial-gradient(circle, rgba(97, 218, 255, 0.3), transparent 58%),
    conic-gradient(from 180deg, rgba(255, 194, 104, 0.62), transparent 18%, rgba(87, 210, 255, 0.58), transparent 46%, rgba(255, 194, 104, 0.5), transparent 74%);
  box-shadow: inset 0 0 18px rgba(83, 211, 255, 0.34);
  animation: jarvis-bot-counter-spin 6.4s linear infinite;
}

.jarvis-bot__scan {
  inset: 35px;
  border: 1px solid rgba(175, 239, 255, 0.68);
  background: linear-gradient(90deg, transparent, rgba(178, 241, 255, 0.42), transparent);
  opacity: 0.55;
  animation: jarvis-bot-scan 3s ease-in-out infinite;
}

.jarvis-bot__core {
  position: relative;
  width: 64px;
  height: 64px;
  border: 1px solid rgba(230, 249, 255, 0.78);
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 48%, #f8fdff 0 11%, #83e8ff 12% 28%, rgba(18, 126, 219, 0.72) 29% 52%, rgba(6, 25, 60, 0.78) 53% 100%);
  box-shadow:
    inset 0 0 18px rgba(255, 255, 255, 0.58),
    0 0 24px rgba(80, 214, 255, 0.62);
  animation: jarvis-bot-hover 3.7s ease-in-out infinite;
}

.jarvis-bot__reactor,
.jarvis-bot__reactor-ring,
.jarvis-bot__line {
  position: absolute;
  pointer-events: none;
}

.jarvis-bot__reactor {
  inset: 22px;
  border-radius: 50%;
  background: #fff9df;
  box-shadow:
    0 0 12px rgba(255, 244, 190, 0.95),
    0 0 28px rgba(92, 223, 255, 0.78);
}

.jarvis-bot__reactor-ring {
  border-radius: 50%;
  border: 1px solid rgba(255, 215, 139, 0.82);
}

.jarvis-bot__reactor-ring--one {
  inset: 13px;
}

.jarvis-bot__reactor-ring--two {
  inset: 5px;
  border-color: rgba(119, 229, 255, 0.66);
}

.jarvis-bot__line {
  left: 14px;
  width: 36px;
  height: 2px;
  border-radius: 999px;
  background: rgba(230, 251, 255, 0.84);
  box-shadow: 0 0 8px rgba(173, 238, 255, 0.78);
}

.jarvis-bot__line--top {
  top: 15px;
}

.jarvis-bot__line--bottom {
  bottom: 15px;
}

.jarvis-bot__equalizer {
  position: absolute;
  right: 18px;
  bottom: 25px;
  display: flex;
  align-items: end;
  gap: 3px;
  opacity: 0.28;
}

.jarvis-bot__equalizer span {
  width: 3px;
  height: 10px;
  border-radius: 6px;
  background: #ffe1a9;
  box-shadow: 0 0 8px rgba(255, 205, 126, 0.82);
  transform-origin: bottom;
}

.jarvis-bot--speaking .jarvis-bot__core {
  animation: jarvis-bot-talk 540ms ease-in-out infinite;
}

.jarvis-bot--speaking .jarvis-bot__halo--outer {
  animation: jarvis-bot-spin 2.2s linear infinite;
}

.jarvis-bot--speaking .jarvis-bot__halo--middle {
  animation: jarvis-bot-counter-spin 1.7s linear infinite;
}

.jarvis-bot--speaking .jarvis-bot__reactor {
  animation: jarvis-bot-reactor 420ms ease-in-out infinite;
}

.jarvis-bot--speaking .jarvis-bot__equalizer {
  opacity: 0.92;
}

.jarvis-bot--speaking .jarvis-bot__equalizer span {
  animation: jarvis-bot-equalizer 480ms ease-in-out infinite;
}

.jarvis-bot--speaking .jarvis-bot__equalizer span:nth-child(2) {
  animation-delay: 90ms;
}

.jarvis-bot--speaking .jarvis-bot__equalizer span:nth-child(3) {
  animation-delay: 180ms;
}

.jarvis-bot--speaking .jarvis-bot__equalizer span:nth-child(4) {
  animation-delay: 270ms;
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

@keyframes jarvis-bot-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes jarvis-bot-counter-spin {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes jarvis-bot-hover {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-7px) scale(1.02);
  }
}

@keyframes jarvis-bot-scan {
  0%,
  100% {
    transform: rotate(-28deg) scaleX(0.82);
    opacity: 0.24;
  }

  50% {
    transform: rotate(28deg) scaleX(1.08);
    opacity: 0.72;
  }
}

@keyframes jarvis-bot-talk {
  0%,
  100% {
    transform: translateY(-2px) scale(1);
  }

  45% {
    transform: translateY(-8px) scale(1.06);
  }
}

@keyframes jarvis-bot-reactor {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.86;
  }

  50% {
    transform: scale(1.22);
    opacity: 1;
  }
}

@keyframes jarvis-bot-equalizer {
  0%,
  100% {
    transform: scaleY(0.5);
  }

  50% {
    transform: scaleY(1.65);
  }
}

@media (max-width: 700px) {
  .visual-bot {
    --visual-bot-scale: 0.7;
  }
}
</style>
