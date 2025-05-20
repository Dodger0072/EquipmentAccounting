using System.Collections.ObjectModel;
using ReactiveUI;
using System.Reactive;

namespace DairyFarm.ViewModels
{
    public class MainWindowViewModel : ReactiveObject
    {
        public ObservableCollection<DairyFarmViewModel> Farms { get; } = new();
        public ReactiveCommand<Unit, Unit> AddFarmCommand { get; }

        public MainWindowViewModel()
        {
            AddFarmCommand = ReactiveCommand.Create(() =>
            {
                Farms.Add(new DairyFarmViewModel());
            });
        }
    }
}
