class FilterDetailScreen < MasterTableScreen
  refreshable
  attr_accessor :search, :attribute

  def on_refresh ; refresh ; end
  def on_appear ; refresh ; end

  def on_load
    @td = [{cells:[{title: "Loading..."}]}]
    super
  end

  def will_appear
    super
    self.title = @search
  end

  def refresh
    @td = [{
      cells:build_cells(GeoJSON.sharedData.by_attribute(@attribute, @search))
    }]
    end_refreshing
    update_table_data
  end

  def table_data
    @td
  end
end
