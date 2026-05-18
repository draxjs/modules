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
      class="visual-bot nexus-bot"
      :class="{'nexus-bot--speaking': speaking}"
      aria-label="Bot visual Nexus"
    >
      <div class="nexus-bot__stage">
        <div class="nexus-bot__glow" />
        <div class="nexus-bot__ring nexus-bot__ring--wide" />
        <div class="nexus-bot__ring nexus-bot__ring--vertical" />
        <div class="nexus-bot__ring nexus-bot__ring--inner" />

        <div class="nexus-bot__lattice" aria-hidden="true">
          <span class="nexus-bot__satellite nexus-bot__satellite--one" />
          <span class="nexus-bot__satellite nexus-bot__satellite--two" />
          <span class="nexus-bot__satellite nexus-bot__satellite--three" />
          <span class="nexus-bot__satellite nexus-bot__satellite--four" />
        </div>

        <div class="nexus-bot__crystal">
          <span class="nexus-bot__crystal-face nexus-bot__crystal-face--top" />
          <span class="nexus-bot__crystal-face nexus-bot__crystal-face--left" />
          <span class="nexus-bot__crystal-face nexus-bot__crystal-face--right" />
          <span class="nexus-bot__core" />
        </div>

        <div class="nexus-bot__signal" aria-hidden="true">
          <span />
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
    drop-shadow(0 16px 22px rgba(0, 190, 176, 0.28))
    drop-shadow(0 0 18px rgba(255, 111, 145, 0.22));
}

.nexus-bot__stage {
  position: relative;
  width: 141px;
  height: 141px;
  display: grid;
  place-items: center;
  transform: scale(var(--visual-bot-scale));
}

.nexus-bot__glow,
.nexus-bot__ring,
.nexus-bot__lattice,
.nexus-bot__satellite,
.nexus-bot__crystal,
.nexus-bot__crystal-face,
.nexus-bot__core {
  position: absolute;
}

.nexus-bot__glow {
  inset: 6px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 48%, rgba(125, 255, 235, 0.36), rgba(41, 124, 255, 0.14) 45%, transparent 72%),
    conic-gradient(from 130deg, transparent 0 32deg, rgba(255, 126, 166, 0.5) 46deg 76deg, transparent 92deg 202deg, rgba(92, 239, 221, 0.58) 222deg 252deg, transparent 270deg 360deg);
  animation: nexus-bot-glow 5.8s ease-in-out infinite;
}

.nexus-bot__ring {
  border-radius: 50%;
  box-shadow:
    inset 0 0 12px rgba(100, 255, 233, 0.18),
    0 0 12px rgba(74, 228, 218, 0.18);
}

.nexus-bot__ring::before {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(from 20deg, transparent 0 38deg, rgba(255, 147, 177, 0.88) 46deg 67deg, transparent 78deg 190deg, rgba(132, 255, 239, 0.9) 202deg 230deg, transparent 242deg 360deg);
  content: "";
  -webkit-mask: radial-gradient(closest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
  mask: radial-gradient(closest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
}

.nexus-bot__ring--wide {
  inset: 9px;
  border: 1px solid rgba(141, 255, 239, 0.42);
  transform: rotate(-17deg) scaleY(0.66);
  animation: nexus-bot-ring-wide 7s linear infinite;
}

.nexus-bot__ring--vertical {
  inset: 16px;
  border: 1px solid rgba(225, 255, 250, 0.34);
  transform: rotate(67deg) scaleY(0.57);
  animation: nexus-bot-ring-vertical 6.1s linear infinite;
}

.nexus-bot__ring--vertical::before {
  background: conic-gradient(from 160deg, transparent 0 54deg, rgba(255, 147, 177, 0.78) 64deg 88deg, transparent 100deg 238deg, rgba(132, 255, 239, 0.86) 248deg 278deg, transparent 292deg 360deg);
}

.nexus-bot__ring--inner {
  inset: 36px;
  border: 2px solid rgba(255, 151, 179, 0.5);
  transform: rotate(23deg) scaleY(0.75);
  animation: nexus-bot-ring-inner 4.4s linear infinite;
}

.nexus-bot__lattice {
  inset: 0;
  z-index: 1;
}

.nexus-bot__lattice::before,
.nexus-bot__lattice::after {
  position: absolute;
  height: 1px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(220, 255, 250, 0.74), transparent);
  content: "";
}

.nexus-bot__lattice::before {
  top: 38px;
  left: 34px;
  width: 74px;
  transform: rotate(24deg);
}

.nexus-bot__lattice::after {
  right: 30px;
  bottom: 38px;
  width: 80px;
  transform: rotate(-31deg);
}

.nexus-bot__satellite {
  width: 8px;
  height: 8px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 50%;
  background: #eafffb;
  box-shadow:
    0 0 9px rgba(132, 255, 236, 0.92),
    0 0 18px rgba(255, 129, 166, 0.42);
  animation: nexus-bot-satellite 2.8s ease-in-out infinite;
}

.nexus-bot__satellite--one {
  top: 30px;
  left: 35px;
}

.nexus-bot__satellite--two {
  top: 40px;
  right: 30px;
  animation-delay: 420ms;
}

.nexus-bot__satellite--three {
  right: 37px;
  bottom: 29px;
  animation-delay: 840ms;
}

.nexus-bot__satellite--four {
  bottom: 40px;
  left: 27px;
  animation-delay: 1260ms;
}

.nexus-bot__crystal {
  z-index: 2;
  width: 70px;
  height: 70px;
  display: grid;
  place-items: center;
  animation: nexus-bot-hover 3.7s ease-in-out infinite;
}

.nexus-bot__crystal::before {
  position: absolute;
  inset: 7px;
  clip-path: polygon(50% 0, 91% 24%, 91% 73%, 50% 100%, 9% 73%, 9% 24%);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.55), transparent 34%),
    linear-gradient(155deg, rgba(126, 255, 235, 0.96), rgba(34, 186, 207, 0.88) 48%, rgba(54, 74, 210, 0.9));
  box-shadow:
    inset 0 0 18px rgba(255, 255, 255, 0.38),
    0 0 22px rgba(94, 255, 232, 0.58);
  content: "";
}

.nexus-bot__crystal::after {
  position: absolute;
  inset: 14px;
  clip-path: polygon(50% 0, 86% 28%, 72% 86%, 28% 86%, 14% 28%);
  background:
    radial-gradient(circle at 50% 44%, rgba(255, 255, 255, 0.92), rgba(130, 255, 235, 0.58) 30%, rgba(255, 121, 160, 0.38) 62%, transparent 70%);
  content: "";
}

.nexus-bot__crystal-face {
  z-index: 1;
  border-radius: 999px;
  background: rgba(245, 255, 253, 0.84);
  box-shadow: 0 0 9px rgba(170, 255, 243, 0.8);
}

.nexus-bot__crystal-face--top {
  top: 18px;
  left: 25px;
  width: 21px;
  height: 2px;
}

.nexus-bot__crystal-face--left,
.nexus-bot__crystal-face--right {
  top: 28px;
  width: 2px;
  height: 23px;
}

.nexus-bot__crystal-face--left {
  left: 21px;
  transform: rotate(24deg);
}

.nexus-bot__crystal-face--right {
  right: 21px;
  transform: rotate(-24deg);
}

.nexus-bot__core {
  z-index: 2;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(248, 255, 253, 0.92);
  border-radius: 50%;
  background:
    radial-gradient(circle, #fff8df 0 14%, #83ffeb 16% 42%, rgba(255, 121, 160, 0.74) 45% 62%, rgba(7, 29, 86, 0.66) 64% 100%);
  box-shadow:
    0 0 13px rgba(128, 255, 235, 0.94),
    0 0 27px rgba(255, 120, 160, 0.46);
}

.nexus-bot__signal {
  position: absolute;
  right: 15px;
  bottom: 24px;
  z-index: 3;
  display: flex;
  align-items: end;
  gap: 3px;
  opacity: 0.34;
}

.nexus-bot__signal span {
  width: 3px;
  height: 9px;
  border-radius: 8px;
  background: #ffb5c9;
  box-shadow: 0 0 8px rgba(255, 135, 169, 0.76);
  transform-origin: bottom;
}

.nexus-bot__signal span:nth-child(2),
.nexus-bot__signal span:nth-child(4) {
  height: 15px;
  background: #b8fff3;
  box-shadow: 0 0 8px rgba(129, 255, 234, 0.78);
}

.nexus-bot__signal span:nth-child(3) {
  height: 21px;
}

.nexus-bot--speaking .nexus-bot__crystal {
  animation: nexus-bot-talk 520ms ease-in-out infinite;
}

.nexus-bot--speaking .nexus-bot__glow {
  animation: nexus-bot-speaking-glow 760ms ease-in-out infinite;
}

.nexus-bot--speaking .nexus-bot__ring--wide {
  animation: nexus-bot-ring-wide 1.9s linear infinite;
}

.nexus-bot--speaking .nexus-bot__ring--vertical {
  animation: nexus-bot-ring-vertical 1.55s linear infinite;
}

.nexus-bot--speaking .nexus-bot__ring--inner {
  animation: nexus-bot-ring-inner 1.25s linear infinite;
}

.nexus-bot--speaking .nexus-bot__core {
  animation: nexus-bot-core 360ms ease-in-out infinite;
}

.nexus-bot--speaking .nexus-bot__satellite {
  animation: nexus-bot-satellite-speaking 560ms ease-in-out infinite;
}

.nexus-bot--speaking .nexus-bot__signal {
  opacity: 0.96;
}

.nexus-bot--speaking .nexus-bot__signal span {
  animation: nexus-bot-signal 460ms ease-in-out infinite;
}

.nexus-bot--speaking .nexus-bot__signal span:nth-child(2) {
  animation-delay: 80ms;
}

.nexus-bot--speaking .nexus-bot__signal span:nth-child(3) {
  animation-delay: 160ms;
}

.nexus-bot--speaking .nexus-bot__signal span:nth-child(4) {
  animation-delay: 240ms;
}

.nexus-bot--speaking .nexus-bot__signal span:nth-child(5) {
  animation-delay: 320ms;
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

@keyframes nexus-bot-glow {
  0%,
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0.78;
  }

  50% {
    transform: translateY(-6px) rotate(8deg) scale(1.04);
    opacity: 1;
  }
}

@keyframes nexus-bot-ring-wide {
  to {
    transform: rotate(343deg) scaleY(0.66);
  }
}

@keyframes nexus-bot-ring-vertical {
  to {
    transform: rotate(-293deg) scaleY(0.57);
  }
}

@keyframes nexus-bot-ring-inner {
  to {
    transform: rotate(-337deg) scaleY(0.75);
  }
}

@keyframes nexus-bot-hover {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }

  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

@keyframes nexus-bot-talk {
  0%,
  100% {
    transform: translateY(-2px) rotate(-4deg) scale(1);
  }

  42% {
    transform: translateY(-10px) rotate(4deg) scale(1.07);
  }

  72% {
    transform: translateY(-5px) rotate(0deg) scale(0.98);
  }
}

@keyframes nexus-bot-satellite {
  0%,
  100% {
    opacity: 0.58;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.18);
  }
}

@keyframes nexus-bot-satellite-speaking {
  0%,
  100% {
    opacity: 0.76;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.45);
  }
}

@keyframes nexus-bot-speaking-glow {
  0%,
  100% {
    opacity: 0.78;
    transform: scale(0.98);
  }

  50% {
    opacity: 1;
    transform: scale(1.16);
  }
}

@keyframes nexus-bot-core {
  0%,
  100% {
    transform: scale(0.9);
  }

  50% {
    transform: scale(1.24);
  }
}

@keyframes nexus-bot-signal {
  0%,
  100% {
    transform: scaleY(0.45);
  }

  50% {
    transform: scaleY(1.72);
  }
}

@media (max-width: 700px) {
  .visual-bot {
    --visual-bot-scale: 0.7;
  }
}
</style>
