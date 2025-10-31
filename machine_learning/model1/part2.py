# ...existing code...
import csv
import io
import argparse
import os
import sys
from collections import defaultdict
from itertools import combinations

def form_teams_from_csv(csv_content: str, score_threshold: int = 300, chunk_size: int = 5) -> str:
    """
    Forms teams of exactly `chunk_size` members (default 5).

    Rules:
    1. Form teams of `chunk_size` members with total score >= score_threshold
    2. Validate that all members in the team have at least 1 common eligibility character
    3. If validation fails, try to reform the team with different combinations
    4. Each candidate can only be assigned to ONE team
    """
    # Auto-detect delimiter (tab, comma, etc.)
    try:
        sample = csv_content[:min(1024, len(csv_content))]
        dialect = csv.Sniffer().sniff(sample)
        reader = csv.DictReader(io.StringIO(csv_content), dialect=dialect)
    except:
        # Fallback to default (comma) if detection fails
        reader = csv.DictReader(io.StringIO(csv_content))
    
    candidates = []  # List of all candidates with their data
    entries = {}  # key: name_lower -> {name, score, eligibility_codes, allocated}

    candidates = []  # List of all candidates with their data
    entries = {}  # key: name_lower -> {name, score, eligibility_codes, allocated}

    for row in reader:
        name = (row.get("id") or row.get("ID") or "").strip()
        if not name:
            continue

        name_key = name.lower()
        # skip duplicate candidate rows (only first occurrence considered)
        if name_key in entries:
            continue

        score_raw = (row.get("profilescore") or row.get("profileScore") or row.get("score") or "").strip()
        try:
            score = float(score_raw)
        except (ValueError, TypeError):
            # invalid score: record but don't add to candidates
            entries[name_key] = {"name": name, "score": None, "eligibility_codes": set(), "allocated": False}
            continue

        eligible_raw = (row.get("eligibility") or row.get("Eligibility") or row.get("Eligible") or "").strip()
        if not eligible_raw:
            # has score but no eligible group -> leftover
            entries[name_key] = {"name": name, "score": score, "eligibility_codes": set(), "allocated": False}
            continue

        # split eligible codes: allow comma/semicolon/pipe/space, otherwise treat as sequence of letters
        if any(sep in eligible_raw for sep in (",", ";", "|", " ")):
            parts = [p.strip() for p in csv.reader([eligible_raw]).__next__() if p.strip()]
            codes = []
            for p in parts:
                if len(p) > 1 and all(ch.isalpha() for ch in p):
                    codes.extend(list(p))
                else:
                    codes.append(p)
        else:
            codes = list(eligible_raw)

        if not codes:
            entries[name_key] = {"name": name, "score": score, "eligibility_codes": set(), "allocated": False}
            continue

        # Store eligibility as a set of lowercase characters
        eligibility_codes = {c.strip().lower() for c in codes if c.strip()}
        if not eligibility_codes:
            entries[name_key] = {"name": name, "score": score, "eligibility_codes": set(), "allocated": False}
            continue

        candidates.append({"name": name, "score": score, "eligibility_codes": eligibility_codes})
        entries[name_key] = {"name": name, "score": score, "eligibility_codes": eligibility_codes, "allocated": False}

    # Helper function to check if a group has at least one common eligibility character
    def has_common_eligibility(team_members):
        if not team_members:
            return False
        # Find intersection of all eligibility sets
        common = set(team_members[0]["eligibility_codes"])
        for member in team_members[1:]:
            common &= member["eligibility_codes"]
        return len(common) > 0
    
    def get_common_code(team_members):
        """Get the first common eligibility code alphabetically"""
        if not team_members:
            return "X"
        common = set(team_members[0]["eligibility_codes"])
        for member in team_members[1:]:
            common &= member["eligibility_codes"]
        return sorted(common)[0].upper() if common else "X"

    # Sort candidates by score (descending) to prioritize high scorers
    candidates.sort(key=lambda c: c["score"], reverse=True)

    # Greedy team formation with combination search
    team_rows = []
    allocated_names = set()
    team_counter = 1

    while True:
        # Get available candidates
        available = [c for c in candidates if c["name"].lower() not in allocated_names]
        
        if len(available) < chunk_size:
            # Not enough candidates left to form a team
            break
        
        # Try to form a valid team from available candidates
        team_formed = False
        best_team = None
        best_score = 0
        
        # Strategy 1: First try consecutive candidates (faster)
        for start_idx in range(len(available) - chunk_size + 1):
            team_candidate = available[start_idx:start_idx + chunk_size]
            total_score = sum(m["score"] for m in team_candidate)
            
            if total_score >= score_threshold and has_common_eligibility(team_candidate):
                # Valid consecutive team found - use it immediately
                best_team = team_candidate
                best_score = total_score
                team_formed = True
                break
        
        # Strategy 2: If no consecutive team found, try all combinations
        # (This is more expensive but finds non-consecutive matches)
        if not team_formed and len(available) <= 15:  # Limit to avoid exponential explosion
            for combo in combinations(available, chunk_size):
                team_candidate = list(combo)
                total_score = sum(m["score"] for m in team_candidate)
                
                if total_score >= score_threshold and has_common_eligibility(team_candidate):
                    # Found a valid combination
                    if total_score > best_score:
                        best_team = team_candidate
                        best_score = total_score
                        team_formed = True
        
        if team_formed and best_team:
            # Add the best team found
            team_code = get_common_code(best_team)
            
            names = "  ".join(m["name"] for m in best_team)
            scores = "  ".join(
                str(int(s["score"])) if float(s["score"]).is_integer() else f"{s['score']:.2f}" 
                for s in best_team
            )
            
            team_rows.append({
                "team_id": f"Team_{team_code}{team_counter}",
                "participant_names": names,
                "score_list": scores
            })
            
            # Mark members as allocated
            for m in best_team:
                name_lower = m["name"].lower()
                allocated_names.add(name_lower)
                entries[name_lower]["allocated"] = True
            
            team_counter += 1
        else:
            # Couldn't form any valid team from remaining candidates
            break

    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=["team_id", "participant_names", "score_list"])
    writer.writeheader()
    writer.writerows(team_rows)
    csv_result = out.getvalue()

    # Compute leftovers: any candidate with a numeric score who was not allocated
    leftovers = [e["name"] for e in entries.values() if isinstance(e.get("score"), (int, float)) and not e.get("allocated")]
    if leftovers:
        print("\nLeftover candidates (not assigned to any emitted team):")
        for n in leftovers:
            print(f"- {n}")
    else:
        print("\nAll candidates with valid scores were assigned to teams (if possible).")

    return csv_result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create final teams CSV from candidate_results CSV")
    parser.add_argument("-i", "--input-file", required=True, help="Path to candidate_results CSV")
    parser.add_argument("-t", "--threshold", type=int, default=300, help="Team score threshold (default: 300)")
    parser.add_argument("-c", "--chunk-size", type=int, default=5, help="Exact team size when forming teams (default: 5)")
    parser.add_argument("-o", "--output-file", default="final_teams.csv", help="Output CSV path (default: final_teams.csv)")
    args = parser.parse_args()

    if not os.path.exists(args.input_file):
        print(f"Input file not found: {args.input_file}", file=sys.stderr)
        sys.exit(1)

    with open(args.input_file, "r", encoding="utf-8") as f:
        csv_input = f.read()

    csv_output = form_teams_from_csv(csv_input, score_threshold=args.threshold, chunk_size=args.chunk_size)

    try:
        with open(args.output_file, "w", encoding="utf-8", newline="") as f:
            f.write(csv_output)
    except PermissionError:
        print(f"Permission denied writing to '{args.output_file}'. Try a different -o path or close the file if it's open.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Failed to write '{args.output_file}': {e}", file=sys.stderr)
        sys.exit(1)

    print(f"\nWrote teams to: {args.output_file}")
# ...existing code...