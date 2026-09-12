import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.lab import Lab, LabAttempt

class LabGradingEngine:
    @staticmethod
    def evaluate_submission(
        lab: Lab,
        submitted_answers: Dict[str, Any],
        mode: str,
        hints_used: int
    ) -> Dict[str, Any]:
        """
        Evaluates user answers against accepted answers for the given lab.
        Calculates total score (0-100), penalties for hints, provides question feedback.
        """
        questions = json.loads(lab.questions_json or "[]")
        if not questions:
            return {
                "score": 100,
                "tier": "SOC Ready",
                "questions_breakdown": [],
                "hints_used": hints_used,
                "penalty": 0,
                "summary": "No questions in this lab."
            }

        total_possible_points = sum(q.get("points", 20) for q in questions)
        earned_points = 0
        breakdown = []

        for q in questions:
            q_id = str(q["id"])
            user_ans = submitted_answers.get(q_id)
            accepted = q.get("accepted_answers", [])
            is_correct = False

            if user_ans is not None:
                cleaned_user = str(user_ans).strip().lower()
                for acc in accepted:
                    cleaned_acc = str(acc).strip().lower()
                    if cleaned_user == cleaned_acc:
                        is_correct = True
                        break

            q_pts = q.get("points", 20)
            if is_correct:
                earned_points += q_pts

            breakdown.append({
                "question_id": q_id,
                "question_text": q.get("question", ""),
                "user_answer": user_ans,
                "accepted_answers": accepted if mode != "ASSESSMENT" else ["Revealed after grading"],
                "is_correct": is_correct,
                "points_earned": q_pts if is_correct else 0,
                "max_points": q_pts,
                "explanation": q.get("explanation", "")
            })

        # Calculate percentage score
        raw_percentage = (earned_points / total_possible_points) * 100 if total_possible_points > 0 else 0

        # Hint penalty: in Practice/Assessment modes, each hint costs 5 points (capped at 15 points)
        hint_penalty = 0
        if mode in ["PRACTICE", "ASSESSMENT"]:
            hint_penalty = min(hints_used * 5, 15)

        final_score = max(0, int(round(raw_percentage - hint_penalty)))

        # Tier classification
        if final_score >= 85:
            tier = "SOC Ready"
            badge_color = "emerald"
        elif final_score >= 70:
            tier = "Intermediate"
            badge_color = "blue"
        elif final_score >= 40:
            tier = "Developing"
            badge_color = "amber"
        else:
            tier = "Beginner"
            badge_color = "rose"

        # Next recommendation
        next_lab_id = (lab.lab_number % 7) + 1

        return {
            "score": final_score,
            "raw_percentage": int(round(raw_percentage)),
            "hint_penalty": hint_penalty,
            "hints_used": hints_used,
            "tier": tier,
            "badge_color": badge_color,
            "questions_breakdown": breakdown,
            "correct_count": sum(1 for b in breakdown if b["is_correct"]),
            "total_questions": len(questions),
            "recommended_next_lab": next_lab_id,
            "feedback_message": f"You scored {final_score}/100. Proficiency rating: {tier}."
        }

lab_grader = LabGradingEngine()
