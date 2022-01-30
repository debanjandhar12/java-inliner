import net.egork.io.*;
// Import array ultils
import net.egork.misc.ArrayUtils;
public class Main2 {
    public static void main(String args[])  {
        InputReader in = new InputReader(System.in);
        int n = in.readIntPairArray(1)[0].first;
        int[] a = {1, 2, 3, 4, 5};
        int min = ArrayUtils.minElement(a);
        System.out.println(n);
    }
}