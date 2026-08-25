import { evaluateFlow } from "./evaluator";
import type {
  ActionNode,
  SurveyFlow,
  SurveyNode,
  VisitorSignals,
} from "./model";

export type ActiveSurvey = { id: string; flow: SurveyFlow };
export type SelectedSurvey = ActiveSurvey & {
  survey: SurveyNode;
  action?: ActionNode;
};

export function selectEligibleSurvey(
  flows: ActiveSurvey[],
  signals: VisitorSignals,
  now = Date.now(),
  wasShownThisSession: (flowId: string) => boolean = () => false,
) {
  for (const candidate of flows) {
    if (wasShownThisSession(candidate.id)) continue;
    const result = evaluateFlow(candidate.flow, signals, now);
    if (result.matched && result.survey)
      return { ...candidate, survey: result.survey, action: result.action };
  }
  return null;
}
