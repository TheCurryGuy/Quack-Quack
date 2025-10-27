import pandas as pd
import os
 
 
def allocate_rooms(teams_df, num_rooms, teams_per_room, output_file="room_allocation.csv"):
    if isinstance(teams_df, str):
        teams_df = pd.read_csv(teams_df)
    
    assignments = []
    room_number = 1
    teams_in_current_room = 0
    
    for _, row in teams_df.iterrows():
        team_id = row["team"]
        
        if teams_in_current_room >= teams_per_room:
            room_number += 1
            teams_in_current_room = 0
        
        assignments.append({"team": team_id, "room_number": f"Room_{room_number}"})
        teams_in_current_room += 1
    
    allocation_df = pd.DataFrame(assignments)
    allocation_df.to_csv(output_file, index=False)
    print(f"✅ Allocation saved to {output_file}")
    
    return allocation_df


if __name__ == "__main__":  
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(BASE_DIR, "team2 (2).csv")
    
    num_rooms = 10
    teams_per_room = 6
    output_file = "room_allocation.csv"
    
    result = allocate_rooms(input_file, num_rooms, teams_per_room, output_file)
    print("\nAllocation Result:")
    print(result)

