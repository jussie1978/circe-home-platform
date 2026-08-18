import './styles.css';
import { PresenceSpike, SPIKE_PARTICLE_COUNT } from './PresenceSpike';

const particleMetric = document.getElementById('metric-particles');
if (particleMetric) {
  particleMetric.textContent = new Intl.NumberFormat('pt-BR').format(SPIKE_PARTICLE_COUNT);
}

const spike = new PresenceSpike();

void spike.initialize().catch((error: unknown) => {
  spike.showError(error);
  spike.dispose();
});

