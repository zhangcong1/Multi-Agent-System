'use client';

import { CheckCircle, Clock, Play, XCircle, Loader2, User, Bot, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Worker {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  type: string;
}

interface Step {
  id: number;
  step_name: string;
  step_order: number;
  status: string;
  input_url: string | null;
  output_url: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  worker: Worker;
}

interface PipelineRun {
  id: number;
  status: string;
  total_steps: number;
  completed_steps: number;
  started_at: string | null;
  completed_at: string | null;
  steps: Step[];
}

interface PipelineViewProps {
  pipeline: PipelineRun;
  index: number;
}

const stepStatusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  PENDING: { label: '等待中', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: Clock },
  RUNNING: { label: '执行中', color: 'text-blue-600', bgColor: 'bg-blue-500', icon: Loader2 },
  WAITING_APPROVAL: { label: '待确认', color: 'text-amber-600', bgColor: 'bg-amber-500', icon: Clock },
  DONE: { label: '已完成', color: 'text-emerald-600', bgColor: 'bg-emerald-500', icon: CheckCircle },
  FAILED: { label: '已失败', color: 'text-red-600', bgColor: 'bg-red-500', icon: XCircle },
  SKIPPED: { label: '已跳过', color: 'text-gray-400', bgColor: 'bg-gray-400', icon: Clock },
};

const pipelineStatusConfig: Record<string, { label: string; color: string }> = {
  RUNNING: { label: '执行中', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  WAITING_APPROVAL: { label: '待确认', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  DONE: { label: '已完成', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  FAILED: { label: '已失败', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export default function PipelineView({ pipeline, index }: PipelineViewProps) {
  const status = pipelineStatusConfig[pipeline.status] || pipelineStatusConfig.RUNNING;
  const progress = pipeline.total_steps > 0 
    ? Math.round((pipeline.completed_steps / pipeline.total_steps) * 100) 
    : 0;

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      {/* Pipeline Header */}
      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              流水线 #{index}
            </span>
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">进度:</span>
              <Progress value={progress} className="w-24 h-2" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {pipeline.completed_steps}/{pipeline.total_steps} 步骤
            </span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          {/* Steps list */}
          <div className="space-y-4">
            {pipeline.steps.map((step, stepIndex) => {
              const stepStatus = stepStatusConfig[step.status] || stepStatusConfig.PENDING;
              const StepIcon = stepStatus.icon;
              const isRunning = step.status === 'RUNNING';
              const isAI = step.worker?.type === 'AI';

              return (
                <div
                  key={step.id}
                  className="relative flex items-start gap-4 pl-12"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-3 w-5 h-5 rounded-full flex items-center justify-center ${
                      isRunning ? 'bg-blue-500' : stepStatus.bgColor
                    } ${isRunning ? 'animate-pulse' : ''}`}
                  >
                    <StepIcon
                      className={`w-3 h-3 text-white ${isRunning ? 'animate-spin' : ''}`}
                    />
                  </div>

                  {/* Step content */}
                  <div className="flex-1 rounded-lg border border-border/50 bg-background p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-foreground">
                            {step.step_name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isAI
                                ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                                : 'bg-blue-purple-500/10 text-blue-purple-600 border-blue-purple-500/20'
                            }`}
                          >
                            {isAI ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                            {step.worker?.name || '未知'}
                          </Badge>
                        </div>

                        {/* Time info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {step.started_at && (
                            <span>
                              开始: {new Date(step.started_at).toLocaleString('zh-CN')}
                            </span>
                          )}
                          {step.completed_at && (
                            <span>
                              完成: {new Date(step.completed_at).toLocaleString('zh-CN')}
                            </span>
                          )}
                        </div>

                        {/* Error message */}
                        {step.error_message && (
                          <div className="mt-2 p-2 rounded bg-red-500/10 text-red-600 text-sm">
                            {step.error_message}
                          </div>
                        )}

                        {/* Links */}
                        {(step.input_url || step.output_url) && (
                          <div className="mt-2 flex items-center gap-3">
                            {step.input_url && (
                              <a
                                href={step.input_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                输入文件
                              </a>
                            )}
                            {step.output_url && (
                              <a
                                href={step.output_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                输出文件
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      <Badge
                        variant="outline"
                        className={`${stepStatus.color} border-current`}
                      >
                        {stepStatus.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
