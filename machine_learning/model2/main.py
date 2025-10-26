import pandas as pd

def allocate_teams_to_rooms(num_rooms, teams_per_room, teams_csv, output_file="room_allocation.csv"):

    if isinstance(teams_csv, str):
        teams = pd.read_csv(teams_csv)
    else:
        teams = teams_csv

    total_capacity = num_rooms * teams_per_room


    if len(teams) > total_capacity:
        print(f"⚠️ Only {total_capacity} teams can be allocated. {len(teams) - total_capacity} teams will remain unassigned.")
        teams = teams.head(total_capacity)

    allocations = []
    room_counter = 1
    team_counter = 0

    for _, row in teams.iterrows():
        room_name = f"Room{room_counter}"
        allocations.append({"room_name": room_name, "team_name": row["team_name"]})
        team_counter += 1

        
        if team_counter % teams_per_room == 0:
            room_counter += 1
            if room_counter > num_rooms:
                break  

    allocation_df = pd.DataFrame(allocations)

    allocation_df.to_csv(output_file, index=False)
    print(f"✅ Allocation complete! Saved to {output_file}")

    return allocation_df

