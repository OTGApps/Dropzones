# class StatesScreen < MasterTableScreen
#   title "Dropzones by State"
#   searchable hide_initially: true

#   def on_appear
#     # Flurry.logEvent("VIEW_STATES") unless Device.simulator?
#   end

#   def will_appear
#     load_data
#   end

#   def load_data
#     @td = [{
#       cells: [state_cell("International")]
#     },{
#       title: "United States",
#       cells: state_names.reject{|name| name == "International" }.map{ |name| state_cell(name) }
#     }]
#     update_table_data
#   end

#   def table_data
#     @td || loading_table_data
#   end

#   def by_state
#     @states ||= GeoJSON.sharedData.by_state
#   end

#   def state_names
#     by_state.keys.sort
#   end

#   def dz_count(state)
#     by_state[state].count
#   end

#   def state_cell(state)
#     count = dz_count(state)
#     if count == 1
#       subtitle = "#{dz_count(state)} Dropzone"
#     else
#       subtitle = "#{dz_count(state)} Dropzones"
#     end

#     {
#       title: state,
#       subtitle: subtitle,
#       cell_identifier: state,
#       accessory_type: :disclosure_indicator,
#       image: UIImage.imageNamed("flags/#{state.downcase.gsub(' ', '-')}"),
#       action: :show_state,
#       arguments: {
#         state_name: state,
#         state: by_state[state]
#       }
#     }
#   end

#   def show_state(args)
#     open StateDetailScreen.new(args)
#   end

# end
