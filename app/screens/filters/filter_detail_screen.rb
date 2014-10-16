class FilterDetailScreen < MasterTableScreen
  attr_accessor :search, :attribute

  def on_load
    @dzs = [{title: 'Loading...'}]
  end

  def will_appear
    self.title = @search
    load_data
  end

  def table_data
    [{cells:@dzs}]
  end

  def load_data
    locate_user(GeoJSON.sharedData.by_attribute(@attribute, @search))
  end
end
