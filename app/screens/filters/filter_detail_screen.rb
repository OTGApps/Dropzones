class FilterDetailScreen < MasterTableScreen
  status_bar :light
  attr_accessor :search, :attribute

  def on_appear
    Flurry.logEvent("VIEW_ATTRIBUTE_DETAIL", withParameters:{attribute: attribute, search: search}) unless Device.simulator?
    refresh
  end

  def on_load
    super
    @td = [{cells:[{title: "Loading..."}]}]
  end

  def will_appear
    self.title = @search
  end

  def refresh
    @td = [{
      cells:build_cells(GeoJSON.sharedData.by_attribute(@attribute, @search))
    }]
    update_table_data
  end

  def table_data
    @td
  end
end
