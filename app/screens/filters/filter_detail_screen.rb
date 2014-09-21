class FilterDetailScreen < MasterTableScreen
  attr_accessor :search, :attribute

  def will_appear
    self.title = @search
  end

  def table_data
    [{cells:dz_cells}]
  end

  def dz_cells
    GeoJSON.sharedData.by_attribute(@attribute, @search).map do |dz|
      {
        title: dz['properties']['name'],
        action: :show_dz,
        accessory_type: :disclosure_indicator,
        arguments: {
          anchor: dz['properties']['anchor']
        }
      }
    end
  end
end
