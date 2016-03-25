class FlaggedScreen < MasterTableScreen
  status_bar :light
  title "Your Flagged Dropzones"

  def on_appear
    Flurry.logEvent("VIEW_FLAGGED") unless Device.simulator?
  end

  def table_data
    [{
      cells: favorite_cells
    }]
  end

  def favorite_cells

    if (favs = GeoJSON.sharedData.favorites) && favs.count > 0
      favs.sort_by{|s| s['current_distance']}.map{ |dz| dz_cell(dz) }
    else
      [{
        title: "Flag some dropzones!",
        subtitle: "Keep track of your favorites here.",
        selection_style: :none,
      }]
    end
  end

end
