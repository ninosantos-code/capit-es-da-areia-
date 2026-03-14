import { Reporter, File, TaskResultPack, Task } from 'vitest/reporters';

export default class AppleReporter implements Reporter {
  onInit() {
    console.log('\n  Tests\n');
  }

  onFinished(files?: File[]) {
    if (!files) return;

    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let totalTime = 0;

    files.forEach(file => {
      if (file.tasks) {
        this.countTasks(file.tasks, stats => {
          passed += stats.passed;
          failed += stats.failed;
          skipped += stats.skipped;
        });
      }
    });

    console.log(`\n  ${failed > 0 ? '\x1b[31m○\x1b[0m' : '\x1b[32m●\x1b[0m'} ${failed > 0 ? failed + ' failed, ' : ''}${passed} passed`);
  }

  onTaskUpdate(packs: TaskResultPack[]) {
    packs.forEach(([id, result]) => {
      // Vitest's internal tasks update handling
      // We can intercept when a single test finishes
    });
  }

  onCollected(files?: File[]) {
      if(!files) return;
      files.forEach(file => {
          console.log(`\n  ${file.name.split('/').pop()?.replace('.test.tsx', '')}`);
      });
  }
  
  onTestCaseResult(test: Task) {
      if (test.type !== 'test') return;
      
      const theme = {
          pass: '\x1b[32m●\x1b[0m',
          fail: '\x1b[31m○\x1b[0m',
          skip: '\x1b[90m◌\x1b[0m',
          muted: '\x1b[90m',
          reset: '\x1b[0m'
      };

      let symbol = theme.skip;
      if (test.result?.state === 'pass') symbol = theme.pass;
      if (test.result?.state === 'fail') symbol = theme.fail;

      let timeStr = '';
      if (test.result?.duration && test.result.duration > 50) {
          timeStr = ` ${theme.muted}${Math.round(test.result.duration)}ms${theme.reset}`;
      }

      console.log(`    ${symbol} ${test.name}${timeStr}`);

      if (test.result?.state === 'fail' && test.result.errors) {
          test.result.errors.forEach(err => {
              console.log(`       ${theme.fail} ${err.message}`);
          });
      }
  }

  private countTasks(tasks: any[], cb: (stats: any) => void) {
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    const traverse = (node: any) => {
      if (node.type === 'test') {
        if (node.result?.state === 'pass') passed++;
        else if (node.result?.state === 'fail') failed++;
        else skipped++;
      } else if (node.tasks) {
        node.tasks.forEach(traverse);
      }
    };

    tasks.forEach(traverse);
    cb({ passed, failed, skipped });
  }
}
