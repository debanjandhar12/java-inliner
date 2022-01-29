import java.util.ArrayList;
import libs.*;

public class HelloWorld {
    public static void main(String args[])  {
      ArrayList<Integer> numbers = new ArrayList<Integer>();
      numbers.add(6);
      numbers.add(9);
      numbers.forEach( (n) -> { System.out.println(n); } );
      InputReader a = new InputReader(System.in);
      int t = a.nextInt();
      System.out.println(t);
    }
}