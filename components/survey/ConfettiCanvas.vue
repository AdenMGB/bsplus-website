<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    active?: boolean;
    intensity?: 'low' | 'high';
  }>(),
  {
    active: true,
    intensity: 'high',
  }
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrame = 0;
let particles: Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
}> = [];

const colors = ['#22c55e', '#eab308', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#ffffff'];

function spawn(width: number, height: number, count: number) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height * -0.2,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      life: Math.random() * 120 + 80,
    });
  }
}

function draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  particles = particles.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.05;
    particle.rotation += particle.rotationSpeed;
    particle.life -= 1;

    if (particle.life <= 0 || particle.y > height + 20) {
      return false;
    }

    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.min(1, particle.life / 40);
    ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
    ctx.restore();
    return true;
  });

  if (props.active && particles.length < (props.intensity === 'high' ? 180 : 80)) {
    spawn(width, height, props.intensity === 'high' ? 4 : 2);
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;
}

function loop() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  draw(ctx, canvas.width, canvas.height);
  animationFrame = requestAnimationFrame(loop);
}

onMounted(() => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  if (props.active) {
    const canvas = canvasRef.value;
    if (canvas) spawn(canvas.width, canvas.height, props.intensity === 'high' ? 80 : 30);
    loop();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas);
  cancelAnimationFrame(animationFrame);
});

watch(
  () => props.active,
  (active) => {
    if (active && !animationFrame) {
      loop();
    }
  }
);

function burst() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  spawn(canvas.width, canvas.height, props.intensity === 'high' ? 60 : 24);
}

defineExpose({ burst });
</script>

<template>
  <div class="pointer-events-none absolute inset-0 h-full w-full">
    <canvas
      ref="canvasRef"
      class="h-full w-full"
      aria-hidden="true"
    />
  </div>
</template>
