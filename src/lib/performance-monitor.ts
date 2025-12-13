// lib/performance-monitor.ts
// Use this for detailed performance tracking

interface PerformanceMetrics {
  phase: string;
  duration: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private startTime: number;
  private metrics: PerformanceMetrics[] = [];
  private checkpoints: Map<string, number> = new Map();

  constructor(private label: string) {
    this.startTime = performance.now();
    console.log(`🚀 [${label}] Started`);
  }

  checkpoint(phase: string) {
    const now = performance.now();
    const duration = now - this.startTime;

    this.metrics.push({
      phase,
      duration,
      timestamp: now,
    });

    this.checkpoints.set(phase, now);
    console.log(`⏱️ [${this.label}] ${phase}: ${duration.toFixed(2)}ms`);
  }

  getTimeBetween(phase1: string, phase2: string): number {
    const time1 = this.checkpoints.get(phase1);
    const time2 = this.checkpoints.get(phase2);

    if (!time1 || !time2) return 0;
    return time2 - time1;
  }

  summary() {
    const totalTime = performance.now() - this.startTime;

    console.group(`📊 [${this.label}] Performance Summary`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.table(
      this.metrics.map((m) => ({
        Phase: m.phase,
        "Time (ms)": m.duration.toFixed(2),
        "Relative (ms)": m.timestamp.toFixed(2),
      }))
    );
    console.groupEnd();

    return {
      label: this.label,
      totalTime,
      metrics: this.metrics,
    };
  }

  // Warn about slow operations
  warnIfSlow(threshold: number = 1000) {
    const totalTime = performance.now() - this.startTime;
    if (totalTime > threshold) {
      console.warn(
        `⚠️ [${this.label}] Slow operation detected: ${totalTime.toFixed(
          2
        )}ms (threshold: ${threshold}ms)`
      );
    }
  }
}

// Example usage in useSendMessage:
// const perfMonitor = new PerformanceMonitor('SendMessage');
// perfMonitor.checkpoint('User message saved');
// perfMonitor.checkpoint('Stream started');
// perfMonitor.checkpoint('Stream completed');
// perfMonitor.checkpoint('AI message saved');
// perfMonitor.summary();
// perfMonitor.warnIfSlow(2000);
